# ADR 0019: TIC Trens na Linha 7-Rubi

- Status: aceito
- Data: 2026-11-12

## Contexto

O responsável pelo projeto solicitou adicionar a TIC Trens, operadora da Linha 7-Rubi. A fonte oficial confirma a frota de trens da Série 9500.

## Decisão

Adicionar TIC Trens como companhia selecionável e transferir a Linha 7-Rubi para essa opção. Preservar a Série 9500, as estações, os lados de desembarque e os salvamentos existentes. A matriz `cptmFleetMatrix` permanece como registro histórico de compatibilidade; a companhia é determinada por `companyId` da linha.

## Consequências

O fluxo continua empresa → linha → frota → sentido → viagem. A Série 9500 usa a foto e ilustração existentes, ainda sem a nova pintura. O logotipo oficial identifica a companhia. Anúncios e rótulos de série são mantidos. Nenhuma outra linha muda de companhia.

Fonte: https://www.tictrens.com.br/noticias/tic-trens-inicia-aplicacao-de-identidade-visual-nos-trens-da-linha-7-rubi-2578 (consulta em 2026-11-12).
