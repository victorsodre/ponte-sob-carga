import {MIT,FHWA} from './project.ts';
export const catalog=[
 {id:'deck',label:'Tabuleiro',detail:'É a superfície que recebe a passagem do veículo e transmite sua ação à estrutura abaixo.',note:'A laje e as vigas seguem uma única curva equivalente. O app não calcula distribuição transversal.',source:MIT},
 {id:'girders',label:'Vigas principais',detail:'As vigas levam a carga aos apoios. Sob a carga móvel, a forma da flexão muda ao longo do vão.',note:'Flexão elástica de uma viga idealizada, com rigidez constante. A ampliação visual não representa dano.',source:MIT},
 {id:'bearings',label:'Apoios',detail:'A articulação à esquerda e o rolete à direita impedem o movimento vertical das extremidades e permitem a rotação. O rolete também permite movimento longitudinal.',note:'Símbolos didáticos. Não há cálculo térmico nem modelo de um aparelho de apoio comercial.',source:FHWA},
 {id:'piers',label:'Pilares e fundações',detail:'Recebem as ações dos apoios e as conduzem ao solo. A distribuição entre as duas extremidades muda com a posição da carga.',note:'Pilares e solo permanecem rígidos neste modelo; as reações vêm do equilíbrio da viga.',source:MIT},
 {id:'joints',label:'Juntas e acessos',detail:'As juntas separam o tabuleiro dos acessos. Ajudam a acomodar movimentos entre partes da estrutura.',note:'Juntas ilustrativas, sem simulação de temperatura, desgaste ou abertura real.',source:FHWA},
 {id:'vehicle',label:'Veículo e carga',detail:'O caminhão indica onde uma carga vertical concentrada atua. Arraste sua posição ou inicie a travessia.',note:'Carga relativa e movimento quase estático. Eixos, peso real, velocidade e impacto não entram no cálculo.',source:MIT}
] as const;
export type PartId=typeof catalog[number]['id'];
