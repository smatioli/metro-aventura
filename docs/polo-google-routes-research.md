# Rota real para Dirigindo o Polo

Consulta às fontes oficiais em 7 de novembro de 2026. Proposta; nenhuma integração foi implementada.

## Caminho recomendado com Google

Usar Google Maps JavaScript API para o mapa e Routes API `computeRoutes` para calcular a rota a partir de origem, destino e pontos intermediários escolhidos pelo autor. Um link compartilhado do Google Maps pode servir de referência para esses locais, mas não deve ser tratado como arquivo de geometria e instruções. A API calcula a rota novamente; não há garantia de reproduzir exatamente o caminho escolhido na interface.

Solicitar `travelMode: "DRIVE"`, `languageCode: "pt-BR"`, `units: "METRIC"`, a polyline da rota e os passos (`routes.legs.steps`). Cada passo oferece distância, início/fim, geometria e `navigationInstruction`: `maneuver` define a seta (por exemplo, esquerda/direita), e `instructions` fornece o texto de navegação, que pode incluir o nome da via. Não há garantia de que todo passo tenha um nome de rua separado; usar o texto recebido em vez de extrair nomes por expressões regulares. [Compute Routes](https://developers.google.com/maps/documentation/routes/reference/rest/v2/TopLevel/computeRoutes), [estrutura da resposta e idioma](https://developers.google.com/maps/documentation/routes/understand-route-response), [obter uma rota](https://developers.google.com/maps/documentation/routes/compute_route_directions).

No jogo, a posição simulada avança sobre a polyline conforme a velocidade do Polo. O próximo passo fornece a seta e o aviso de conversão. A locução poderia dizer uma instrução como “Vire à direita na Rua …”, acionada por distância simulada e acompanhada de uma seta grande. Esta organização do jogo é uma proposta de implementação, não um recurso automático da Routes API.

## Limites que afetam a escolha

- Resultados da Routes API não podem ser usados junto de mapa de outro fornecedor. Para Google Routes, usar mapa Google; manter a atribuição exigida. Os termos permitem uso sem mapa, mas vedam associação com mapa não Google. [Termos específicos, seção 19](https://cloud.google.com/maps-platform/terms/maps-service-terms).
- Não transformar a resposta completa em JSON permanente versionado no repositório. As políticas restringem extração, armazenamento e redistribuição; a exceção de coordenadas dura até 30 dias e não libera automaticamente o armazenamento das instruções. Place IDs têm exceção própria. [Políticas da Routes API](https://developers.google.com/maps/documentation/routes/policies).
- Para chamadas REST, proteger a chave em serviço servidor/proxy; não colocá-la em `VITE_*`, pois entraria no JavaScript público. A chave do SDK de mapa no navegador precisa das restrições de site e API apropriadas. Um proxy deve aceitar somente solicitações previstas e ter proteção de acesso; no Netlify isso implicaria adicionar uma função e controles, alterando a arquitetura hoje estática. [Segurança oficial](https://developers.google.com/maps/api-security-best-practices).
- A conversão dos dados Google em fala exige atenção aos termos de conteúdo derivado: a política cita explicitamente restrições a certas conversões de texto em voz (como tempos de viagem). As páginas consultadas não bastam para afirmar que qualquer uso das instruções com `speechSynthesis` esteja liberado. Antes de escolher essa arquitetura para locução, confirmar a permissão com Google; alternativamente usar uma origem de rota com licença compatível com narração e persistência. [Políticas](https://developers.google.com/maps/documentation/routes/policies).

Para um jogo estático com rota fixa que possa ficar salva e narrada, a alternativa a investigar é mapa com dados OpenStreetMap e motor de rotas compatível. Isso exige verificar separadamente licença, atribuição, política do servidor de mapas e termos do provedor de rotas; não reutilizar dados Google sobre esse mapa.
