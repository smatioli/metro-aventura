"""Enrich a fixed GeoJSON using an already downloaded Overpass out-geom JSON.

Usage: python3 scripts/prepare-polo-route.py ROUTE_ID GEOJSON OVERPASS_JSON
Original GeoJSON files are never modified. No network requests are made here.
"""
import datetime
import json
import math
import pathlib
import sys

route_id, source_path, osm_path = sys.argv[1:]
root = pathlib.Path(__file__).resolve().parents[1]
output = root / 'public/routes'


def project(c):
    return ((c[0] + 46.56) * 111320 * math.cos(math.radians(-23.57)), (-23.57 - c[1]) * 111320)


source = json.loads(pathlib.Path(source_path).read_text())
points = []
for coordinate in source['geometry']['coordinates']:
    p = project(coordinate)
    if not points or math.dist(p, points[-1]) > .1:
        points.append(p)
raw = json.loads(pathlib.Path(osm_path).read_text())
if raw.get('remark'):
    raise ValueError(raw['remark'])
if not raw.get('elements'):
    raise ValueError('Overpass did not return any streets')

# Keep only the map corridor, avoiding a large city-wide asset on mobile.
corridor = set()
for a, b in zip(points, points[1:]):
    for step in range(max(1, math.ceil(math.dist(a, b) / 100)) + 1):
        t = min(1, step / max(1, math.ceil(math.dist(a, b) / 100)))
        x, y = (a[j] + t * (b[j] - a[j]) for j in (0, 1))
        cx, cy = math.floor(x / 100), math.floor(y / 100)
        for dx in range(-4, 5):
            for dy in range(-4, 5):
                corridor.add((cx + dx, cy + dy))
streets = []
segments = []
grid = {}
excluded = {'footway', 'cycleway', 'path', 'steps', 'pedestrian', 'bridleway', 'construction', 'proposed'}
for element in raw['elements']:
    tags = element.get('tags', {})
    coordinates = [[p['lon'], p['lat']] for p in element.get('geometry', [])]
    if len(coordinates) < 2 or not tags.get('name'):
        continue
    projected = [project(c) for c in coordinates]
    if not any((math.floor(p[0] / 100), math.floor(p[1] / 100)) in corridor for p in projected):
        continue
    streets.append({'name': tags['name'], 'coordinates': coordinates})
    if tags.get('highway') in excluded:
        continue
    for a, b in zip(projected, projected[1:]):
        length = math.dist(a, b)
        if not length:
            continue
        index = len(segments)
        segments.append((a, b, length, tags['name']))
        for x in range(math.floor((min(a[0], b[0]) - 35) / 80), math.floor((max(a[0], b[0]) + 35) / 80) + 1):
            for y in range(math.floor((min(a[1], b[1]) - 35) / 80), math.floor((max(a[1], b[1]) + 35) / 80) + 1):
                grid.setdefault((x, y), []).append(index)

names = []
missing = []
for index, (a, b) in enumerate(zip(points, points[1:])):
    p = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
    length = math.dist(a, b)
    best, name = float('inf'), ''
    for candidate in grid.get((math.floor(p[0] / 80), math.floor(p[1] / 80)), []):
        c, d, street_length, street_name = segments[candidate]
        dx, dy = d[0] - c[0], d[1] - c[1]
        alignment = abs(((b[0] - a[0]) * dx + (b[1] - a[1]) * dy) / (length * street_length))
        if alignment < .7:
            continue
        t = max(0, min(1, ((p[0] - c[0]) * dx + (p[1] - c[1]) * dy) / street_length**2))
        distance = math.hypot(p[0] - c[0] - t * dx, p[1] - c[1] - t * dy)
        score = distance + 12 * (1 - alignment)
        if distance <= 30 and score < best:
            best, name = score, street_name
    names.append(name)
    if not name:
        missing.append(index)
metadata = {'source': 'OpenStreetMap contributors / Overpass API', 'license': 'ODbL-1.0', 'preparedAt': str(datetime.date.today()), 'streetNames': names, 'unmatchedSegments': missing}
(output / f'{route_id}-streets.json').write_text(json.dumps(streets, ensure_ascii=False, separators=(',', ':')) + '\n')
(output / f'{route_id}-navigation.json').write_text(json.dumps(metadata, ensure_ascii=False, separators=(',', ':')) + '\n')
print(f'{route_id}: {len(streets)} map ways, {len(names)-len(missing)}/{len(names)} segments named, unmatched: {missing}')
