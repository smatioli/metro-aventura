# ADR 0010: Estilo híbrido com identidade fiel das frotas

- Status: aceito
- Data: 2026-07-21

## Contexto

O jogador reconhece e prefere determinadas frotas do Metrô de São Paulo, cada uma com seu próprio esquema visual. Um trem genérico reduziria o interesse e poderia representar incorretamente aquilo que ele conhece.

## Decisão

O jogo terá estilo visual híbrido:

- trens, cores das linhas e placas serão reconhecíveis e baseados em referências reais;
- cenários e passageiros serão ilustrações simples, limpas e amigáveis;
- cada frota terá uma ficha visual própria, baseada nas fotografias de referência fornecidas;
- diferenças importantes da parte externa, interior e cabine serão preservadas;
- simplificações artísticas não deverão apagar características usadas pelo jogador para identificar a frota.

## Fotografias de referência

Para cada frota, são desejáveis imagens da frente, lateral, portas, interior e cabine. As fotos devem ser identificadas com o nome da frota quando conhecido. Referências com ângulos e iluminação diferentes ajudam a separar características reais de reflexos ou perspectiva.

As fotografias servirão como referência para produzir ilustrações próprias. Seu uso direto na interface dependerá de permissão ou licença adequada.

## Consequências

- O modelo de dados deverá relacionar cada frota às linhas em que pode aparecer.
- A seleção ou distribuição das frotas ainda precisa ser definida.
- A produção gráfica será modular para permitir adicionar novas frotas posteriormente.
- As três perspectivas exigem referências externas, internas e da cabine para cada frota representada.

