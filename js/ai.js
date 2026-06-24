/**
 * AeroPulse AI Copilot
 * Generates DISC-adapted feedback texts, action plans, and predicts risk mitigations.
 */

class AeroPulseAICopilot {
  /**
   * Generates feedback wording and delivery strategy adapted to the employee's DISC profile.
   * @param {string} colaboradorId 
   * @param {string} area ('performance' | 'seguranca' | 'comportamento')
   * @param {string} tom ('positivo' | 'construtivo')
   * @returns {Object} { abordagem_estrategica, texto_sugerido, dicas_entrega }
   */
  sugerirAbordagemFeedback(colaboradorId, area, tom) {
    const colaborador = window.db.getColaboradorById(colaboradorId);
    const disc = window.db.getDiscResultByColaborador(colaboradorId);
    
    if (!colaborador) return null;

    const perfilTipo = disc ? disc.principal : 'S';

    const templates = {
      'D': {
        abordagem_estrategica: "Abordagem direta, objetiva e focada em metas e impacto nos resultados.",
        dicas_entrega: [
          "Evite rodeios ou conversas informais longas.",
          "Aponte o impacto direto dos resultados dele na pontualidade/operação do aeroporto.",
          "Dê autonomia e pergunte qual o plano dele para resolver a questão."
        ],
        templates: {
          'performance': {
            'positivo': `Excelente entrega de resultados operacionais nas últimas escalas. Seu tempo de atendimento e despacho foi o melhor do setor. Continue acelerando e liderando a operação com esse foco em eficiência.`,
            'construtivo': `Temos uma meta operacional clara de SLA no portão que não foi atingida nas últimas 3 escalas. Preciso que você lidere a correção desse indicador diretamente. Quais recursos você precisa para restabelecer a velocidade da operação amanhã?`
          },
          'seguranca': {
            'positivo': `Sua conformidade com os regulamentos de segurança da ANAC foi impecável. Esse rigor protege a operação e evita atrasos críticos para a companhia. Excelente trabalho.`,
            'construtivo': `Identificamos que você pulou o checklist de segurança obrigatório em duas ocasiões. Na nossa operação, segurança é inegociável e atalhos colocam vidas em risco. Preciso do seu compromisso direto em seguir 100% dos procedimentos a partir do próximo voo.`
          },
          'comportamento': {
            'positivo': `Sua determinação e proatividade em resolver problemas complexos sob pressão têm sido fundamentais. Você traz dinamismo para o grupo.`,
            'construtivo': `Sua cobrança por resultados tem sido percebida de forma agressiva pela equipe de rampa, gerando atritos desnecessários que atrasam o processo. Precisamos manter o ritmo operacional forte, mas sem desgastar a comunicação com os liderados.`
          }
        }
      },
      'I': {
        abordagem_estrategica: "Abordagem calorosa, empática, valorizando o relacionamento e o impacto nas pessoas.",
        dicas_entrega: [
          "Inicie com uma conversa informal acolhedora.",
          "Reconheça a simpatia e a habilidade de comunicação dele(a).",
          "Mostre como as falhas afetam os colegas e a imagem da empresa perante os clientes."
        ],
        templates: {
          'performance': {
            'positivo': `Seu carisma e energia no atendimento são fantásticos! Os passageiros da primeira classe elogiaram muito sua postura acolhedora. Você eleva o nível reputacional da nossa companhia com essa simpatia contagiante. Parabéns!`,
            'construtivo': `Você tem uma energia de comunicação maravilhosa, mas precisamos alinhar seu foco na precisão dos horários de embarque. Pequenas dispersões no gate estão gerando atrasos que afetam o fechamento das portas. Vamos criar um método visual para te ajudar nisso?`
          },
          'seguranca': {
            'positivo': `Muito bom ver como você engaja a equipe a seguir os protocolos de segurança com leveza e otimismo. Sua liderança informal apoia o time a voar seguro.`,
            'construtivo': `Seu carisma é incrível, mas as regras de segurança e checklists operacionais exigem atenção concentrada absoluta. Conversar demais na cabine durante momentos críticos está gerando falhas nos procedimentos. Preciso que você isole os momentos de foco operacional.`
          },
          'comportamento': {
            'positivo': `Sua empatia e habilidade de mediação no VIP lounge deixam o ambiente leve e agradável tanto para clientes quanto para colegas.`,
            'construtivo': `Você acabou se dispersando nas discussões do último briefing e não captou as diretrizes críticas de escala. Seu envolvimento social é excelente, mas precisamos que sua escuta ativa esteja ligada nos momentos de repasse operacional.`
          }
        }
      },
      'S': {
        abordagem_estrategica: "Abordagem estruturada, calma, demonstrando apoio mútuo e estabilidade.",
        dicas_entrega: [
          "Mantenha um tom de voz tranquilo e amigável.",
          "Garanta previsibilidade na conversa, mostrando que o feedback visa o crescimento seguro.",
          "Ofereça apoio prático: 'Estou aqui para construirmos isso juntos'."
        ],
        templates: {
          'performance': {
            'positivo': `Sua consistência operacional e calma durante a reprogramação de voos foram exemplares. A equipe se sente segura ao seu lado porque sabe que pode confiar na sua constância. Muito obrigado pela sua dedicação diária.`,
            'construtivo': `Temos observado que você hesita um pouco em assumir decisões urgentes quando ocorrem cancelamentos em massa de voos. Sei que você prefere planejar, mas a operação exige respostas rápidas. Vamos treinar alguns cenários comuns para você se sentir mais seguro?`
          },
          'seguranca': {
            'positivo': `Sua precisão silenciosa e respeito absoluto às normas de solo evitam qualquer falha de conformidade na rampa. Você é um porto seguro para o compliance da empresa.`,
            'construtivo': `Houve uma atualização recente nas regras de despacho de bagagens especiais. Notei que você continuou seguindo o modelo antigo para evitar riscos, mas precisamos nos atualizar. Vamos fazer essa transição juntos amanhã?`
          },
          'comportamento': {
            'positivo': `Sua paciência e espírito cooperativo no balcão de informações ajudam a desarmar passageiros irritados de forma formidável.`,
            'construtivo': `Você tem guardado muitas preocupações para si devido ao estresse operacional das escalas, o que acabou gerando um desgaste físico visível. Quero que saiba que nossa gestão está aberta a ouvir e te apoiar a equilibrar essa carga de trabalho.`
          }
        }
      },
      'C': {
        abordagem_estrategica: "Abordagem formal, baseada em dados, normas e com critérios técnicos exatos.",
        dicas_entrega: [
          "Evite adjetivos vagos; use dados, datas e fatos específicos.",
          "Refira-se a manuais, checklists e procedimentos documentados.",
          "Dê tempo para ele(a) analisar os argumentos e responder de forma fundamentada."
        ],
        templates: {
          'performance': {
            'positivo': `Excelente precisão operacional no balanceamento técnico das aeronaves. Seu índice de erros nos últimos 6 meses foi zero, batendo nossa meta interna de qualidade. Sua exatidão técnica garante a segurança de todos os voos.`,
            'construtivo': `Seu relatório técnico apontou um atraso operacional de 12 minutos. Embora as justificativas façam sentido, a meta estipulada no manual é de no máximo 8 minutos para essa rota. Vamos analisar os gargalos do processo no gráfico de fluxo para identificar melhorias?`
          },
          'seguranca': {
            'positivo': `Seu compromisso com o manual de segurança e conformidade da ANAC é irretocável. Seu rigor e auditorias constantes elevam o compliance de todo o setor operacional.`,
            'construtivo': `Detectamos que um dos checklists obrigatórios de rampa foi preenchido de forma incompleta no dia 12. Entendo o pico de trabalho, mas a precisão documental da segurança é vital para o nosso certificado operacional. Como podemos blindar esse processo?`
          },
          'comportamento': {
            'positivo': `Sua postura profissional, discreta e focada em normas técnicas serve de modelo de conformidade ética para todos os colaboradores.`,
            'construtivo': `Sua comunicação por e-mail e nos briefings operacionais tem sido excessivamente técnica e impessoal, gerando barreiras com os novos colaboradores em treinamento. Precisamos dosar o rigor técnico com orientações mais didáticas e acessíveis.`
          }
        }
      }
    };

    const perfilTemplates = templates[perfilTipo] || templates['S'];
    const areaTemplate = perfilTemplates.templates[area] || perfilTemplates.templates['performance'];
    const textoSugerido = areaTemplate[tom] || areaTemplate['positivo'];

    return {
      perfil: window.discEngine.interpretacoes[perfilTipo].nome,
      perfil_sigla: perfilTipo,
      cor_perfil: window.discEngine.interpretacoes[perfilTipo].cor,
      abordagem_estrategica: perfilTemplates.abordagem_estrategica,
      dicas_entrega: perfilTemplates.dicas_entrega,
      texto_sugerido: textoSugerido
    };
  }

  /**
   * Recommends a custom action plan based on the lowest performance pillar.
   * @param {string} colaboradorId 
   * @param {string} pilarFraco ('comunicacao' | 'conformidade' | 'resolucao_problemas' | 'empatia')
   * @returns {Object} { titulo, descricao, metas, prazo_dias }
   */
  sugerirPlanoAcao(colaboradorId, pilarFraco) {
    const colaborador = window.db.getColaboradorById(colaboradorId);
    if (!colaborador) return null;

    const recomendacoes = {
      'comunicacao': {
        titulo: 'Desenvolvimento de Comunicação Assertiva Operacional',
        descricao: 'Treinamento focado em comunicação clara, repasse exato de diretrizes de escala e briefings de voo integrados, reduzindo ruídos entre tripulação e gate.',
        metas: 'Concluir micro-curso de Comunicação Assertiva em Ambientes Críticos (3h) e realizar 3 simulações de rádio/handover sem ruídos.',
        prazo_dias: 30
      },
      'conformidade': {
        titulo: 'Reciclagem e Rigor em Protocolos de Segurança',
        descricao: 'Revisão intensiva dos manuais operacionais da empresa e acompanhamento assistido em pista/cabine para garantir aderência a checklists de segurança inegociáveis.',
        metas: 'Obter 100% de conformidade operacional nas próximas 10 auditorias surpresa no setor de embarque/cabine.',
        prazo_dias: 15
      },
      'resolucao_problemas': {
        titulo: 'Capacitação em Tomada de Decisão e Gestão de Crise',
        descricao: 'Capacitar o colaborador no modelo de tomada de decisão estruturada para eventos de atrasos operacionais massivos (overbooking, condições meteorológicas desfavoráveis).',
        metas: 'Participar da simulação de contingência do aeroporto e estruturar um fluxograma pessoal de decisões para contingências.',
        prazo_dias: 45
      },
      'empatia': {
        titulo: 'Excelência em Atendimento Humanizado e CNV',
        descricao: 'Aprimorar a escuta ativa e empatia com passageiros em situações de atrito reputacional elevado (extravio de bagagem, upgrade negado, cancelamento de conexões).',
        metas: 'Assistir palestras de Atendimento Premium e obter nota média mínima de 9.0 nas autoavaliações de passageiros na sala VIP.',
        prazo_dias: 30
      }
    };

    const sugestao = recomendacoes[pilarFraco] || recomendacoes['comunicacao'];
    
    const today = new Date();
    today.setDate(today.getDate() + sugestao.prazo_dias);
    const prazoFormatado = today.toISOString().split('T')[0];

    return {
      colaborador_id: colaboradorId,
      titulo: sugestao.titulo,
      descricao: sugestao.descricao,
      metas: sugestao.metas,
      prazo: prazoFormatado
    };
  }
}

window.aiCopilot = new AeroPulseAICopilot();
