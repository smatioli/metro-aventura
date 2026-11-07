"""Write an Overpass query for a fixed route's bounding box.

Usage: python3 scripts/prepare-polo-queries.py GEOJSON OUTPUT_QUERY
Then download with curl -G --data-urlencode data@OUTPUT_QUERY
https://overpass-api.de/api/interpreter -o OVERPASS_JSON
"""
import json
import pathlib
import sys

source, destination = sys.argv[1:]
coordinates = json.loads(pathlib.Path(source).read_text())['geometry']['coordinates']
bounds = (
    min(p[1] for p in coordinates) - .002,
    min(p[0] for p in coordinates) - .002,
    max(p[1] for p in coordinates) + .002,
    max(p[0] for p in coordinates) + .002,
)
query = '[out:json][timeout:90];way[highway][name](' + ','.join(str(x) for x in bounds) + ');out geom;'
pathlib.Path(destination).write_text(query + '\n')
