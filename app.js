import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Image,} from 'react-native';

const PROJETO_ID = 'nuvem2-joao-a31b2';
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJETO_ID}/databases/(default)/documents/agendamentos`;

const CORES = {
  aquamarine: '#A9FFCB',
  celadon: '#B6EEA6',
  lavenderGrey: '#A4A8D1',
  powderBlue: '#A4BFEB',
  coolSteel: '#8CABBE',
  branco: '#FFFFFF',
  fundo: '#F7FBF8',
  textoEscuro: '#405A69',
  borda: '#E6EDF0',
};

export default function App() {
  const [tela, setTela] = useState('perfil');
  const [perfil, setPerfil] = useState(null);
  const [petUsuario, setPetUsuario] = useState('');
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentoSelecionado, setAgendamentoSelecionado] =
    useState(null);
  const [formulario, setFormulario] = useState({
    nomePet: '',
    nomeTutor: '',
    servico: '',
    data: '',
    horario: '',
    imagem: '',
  });

  const [carregando, setCarregando] = useState(false);
  const [editando, setEditando] = useState(false);
  async function buscarAgendamentos() {
    try {
      setCarregando(true);
      const resposta = await fetch(FIRESTORE_URL);
      if (!resposta.ok) {
        throw new Error('Erro ao buscar agendamentos.');
      }
      const dados = await resposta.json();
      if (!dados.documents) {
        setAgendamentos([]);
        return;
      }
      const lista = dados.documents.map((documento) => {
        const campos = documento.fields || {};
        return {
          id: documento.name.split('/').pop(),
          nomePet: campos.nomePet?.stringValue || '',
          nomeTutor: campos.nomeTutor?.stringValue || '',
          servico: campos.servico?.stringValue || '',
          data: campos.data?.stringValue || '',
          horario: campos.horario?.stringValue || '',
          imagem: campos.imagem?.stringValue || '',
        };
      });
      setAgendamentos(lista);
    } catch (erro) {
      console.log(erro);
      Alert.alert(
        'Erro',
        'Não foi possível carregar os agendamentos.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (tela === 'lista') {
      buscarAgendamentos();
    }
  }, [tela]);

  function selecionarPerfil(tipo) {
    setPerfil(tipo);
    if (tipo === 'admin') {
      setTela('lista');
      return;
    }
    if (tipo === 'usuario') {
      setPetUsuario('');
      setTela('identificarPet');
    }
  }

  function entrarComoUsuario() {
    const nomePet = petUsuario.trim();
    if (!nomePet) {
      Alert.alert(
        'Atenção',
        'Digite o nome do seu pet para continuar.'
      );
      return;
    }
    setPetUsuario(nomePet);
    setTela('lista');
  }

  function abrirDetalhes(agendamento) {
    setAgendamentoSelecionado(agendamento);
    setTela('detalhes');
  }

  function abrirCadastro() {
    if (perfil !== 'admin') {
      return;
    }
    setEditando(false);
    setFormulario({
      nomePet: '',
      nomeTutor: '',
      servico: '',
      data: '',
      horario: '',
      imagem: '',
    });
    setTela('cadastro');
  }
  function abrirEdicao(agendamento) {
    if (perfil !== 'admin') {
      return;
    }
    setEditando(true);
    setAgendamentoSelecionado(agendamento);
    setFormulario({
      nomePet: agendamento.nomePet,
      nomeTutor: agendamento.nomeTutor,
      servico: agendamento.servico,
      data: agendamento.data,
      horario: agendamento.horario,
      imagem: agendamento.imagem || '',
    });
    setTela('cadastro');
  }

  function prepararCampos() {
    return {
      fields: {
        nomePet: {
          stringValue: formulario.nomePet,
        },
        nomeTutor: {
          stringValue: formulario.nomeTutor,
        },
        servico: {
          stringValue: formulario.servico,
        },
        data: {
          stringValue: formulario.data,
        },
        horario: {
          stringValue: formulario.horario,
        },
        imagem: {
          stringValue: formulario.imagem || '',
        },
      },
    };
  }
  async function salvarAgendamento() {

    if (perfil !== 'admin') {

      Alert.alert(
        'Acesso negado',
        'Somente o administrador pode realizar esta ação.'
      );
      return;
    }
    if (
      !formulario.nomePet.trim() ||
      !formulario.nomeTutor.trim() ||
      !formulario.servico.trim() ||
      !formulario.data.trim() ||
      !formulario.horario.trim()
    ) {
      Alert.alert(
        'Atenção',
        'Preencha todos os campos obrigatórios.'
      );
      return;
    }
    try {
      setCarregando(true);
      const dados = prepararCampos();
      if (editando && agendamentoSelecionado) {
        const resposta = await fetch(
          `${FIRESTORE_URL}/${agendamentoSelecionado.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
          }
        );
        if (!resposta.ok) {
          throw new Error('Erro ao atualizar.');
        }
        Alert.alert(
          'Sucesso',
          'Agendamento atualizado com sucesso!'
        );
      }
      else {
        const resposta = await fetch(
          FIRESTORE_URL,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
          }
        );
        if (!resposta.ok) {
          throw new Error('Erro ao cadastrar.');
        }
        Alert.alert(
          'Sucesso',
          'Agendamento cadastrado com sucesso!'
        );
      }
      setTela('lista');
    } catch (erro) {
      console.log(erro);
      Alert.alert(
        'Erro',
        'Não foi possível salvar o agendamento.'
      );
    } finally {
      setCarregando(false);
    }
  }

  function excluirAgendamento(id) {
    if (perfil !== 'admin') {
      Alert.alert(
        'Acesso negado',
        'Somente o administrador pode excluir agendamentos.'
      );
      return;
    }
    Alert.alert(
      'Excluir agendamento',
      'Deseja realmente excluir este agendamento?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setCarregando(true);
              const resposta = await fetch(
                `${FIRESTORE_URL}/${id}`,
                {
                  method: 'DELETE',
                }
              );
              if (!resposta.ok) {
                throw new Error('Erro ao excluir.');
              }
              Alert.alert(
                'Sucesso',
                'Agendamento excluído com sucesso!'
              );
            
              await buscarAgendamentos();
            } catch (erro) {
              console.log(erro);
              Alert.alert(
                'Erro',
                'Não foi possível excluir o agendamento.'
              );
            } finally {
              setCarregando(false);
            }
          },
        },
      ]
    );
  }

  const agendamentosVisiveis =
    perfil === 'admin' ? agendamentos : agendamentos.filter((item) => item.nomePet.trim().toLowerCase() === petUsuario.trim().toLowerCase());
  if (tela === 'perfil') {
    return (
      <View style={styles.containerPerfil}>
        <Text style={styles.logo}>
          🐾
        </Text>
        <Text style={styles.titulo}>
          Amigo Fiel
        </Text>
        <Text style={styles.subtitulo}>
          Petshop
        </Text>
        <Text style={styles.instrucao}>
          Selecione seu perfil
        </Text>
        <TouchableOpacity style={styles.botaoAdmin} onPress={() => selecionarPerfil('admin')}>
          <Text style={styles.textoBotao}>
            Administrador
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoUsuario} onPress={() => selecionarPerfil('usuario')}>
          <Text style={styles.textoBotao}>
            Usuario
          </Text>
        </TouchableOpacity>
        <Text style={styles.rodape}>
          Cuidado e carinho para o seu melhor amigo.
        </Text>
      </View>
    );
  }
  if (tela === 'identificarPet') {
    return (
      <View style={styles.containerPerfil}>
        <Text style={styles.logo}>
          🐶
        </Text>
        <Text style={styles.tituloPet}>
          Ola!
        </Text>
        <Text style={styles.instrucaoPet}>
          Para consultar os agendamentos,
          informe o nome do seu pet.
        </Text>
        <Text style={styles.label}>
          Nome do Pet
        </Text>
        <TextInput style={styles.input} placeholder="Ex: Thor" placeholderTextColor={CORES.lavenderGrey} value={petUsuario} onChangeText={setPetUsuario} autoCapitalize="words"/>
        <TouchableOpacity style={styles.botaoContinuar} onPress={entrarComoUsuario}>
          <Text style={styles.textoBotao}>
            Ver meus agendamentos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoVoltarPerfil} onPress={() => { setPerfil(null); setPetUsuario(''); setTela('perfil');}}>
          <Text style={styles.textoBotaoEscuro}>
            Voltar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (tela === 'lista') {
    return (
      <View style={styles.containerLista}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitulo}>
              Agendamentos
            </Text>
            <Text style={styles.headerPerfil}>
             {perfil === 'admin' ? 'Administrador' : `Pet: ${petUsuario}`}
            </Text>
          </View>
          <TouchableOpacity onPress={() => { setPerfil(null); setPetUsuario(''); setTela('perfil');}}>
            <Text style={styles.sair}>
              Sair
            </Text>
          </TouchableOpacity>
        </View>
        {carregando && (
          <ActivityIndicator
            size="large"
            color={CORES.coolSteel}
            style={styles.loading}
          />
        )}

        {!carregando && (
          <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
            {agendamentosVisiveis.length === 0 && (
              <View style={styles.semAgendamento}>
                <Text style={styles.semAgendamentoIcone}>
                  🐾
                </Text>
                <Text style={styles.vazioTitulo}>
                  Nenhum agendamento encontrado
                </Text>
                <Text style={styles.vazioTexto}>
                  {perfil === 'admin' ? 'Ainda não existem agendamentos cadastrados.' : `Não encontramos agendamentos para "${petUsuario}".`}
                </Text>
              </View>
            )}

            {agendamentosVisiveis.map((item) => (
              <TouchableOpacity key={item.id} style={styles.card} onPress={() => abrirDetalhes(item)} activeOpacity={0.8}>
                <View style={styles.cardCabecalho}>
                  {item.imagem ? (
                    <Image
                      source={{
                        uri: item.imagem,
                      }}
                      style={styles.fotoPet}
                    />

                  ) : (
                    <View style={styles.fotoPetSemImagem}>
                      <Text style={styles.iconeSemImagem}>
                        🐾
                      </Text>
                    </View>
                  )}

                  <View style={styles.dadosPet}>
                    <Text style={styles.pet}>
                      {item.nomePet}
                    </Text>
                    <Text style={styles.tutor}>
                      Tutor: {item.nomeTutor}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.info}>
                    Servico: {item.servico}
                  </Text>
                  <Text style={styles.info}>
                    📅 {item.data}
                  </Text>
                  <Text style={styles.info}>
                    🕐 {item.horario}
                  </Text>
                </View>

                {perfil === 'admin' && (
                  <View style={styles.acoes}>
                    <TouchableOpacity style={styles.botaoEditar} onPress={() => abrirEdicao(item)}>
                      <Text style={styles.textoAcao}>
                        Editar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.botaoExcluir} onPress={() =>  excluirAgendamento(item.id)}>
                      <Text style={styles.textoAcao}>
                        Excluir
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {perfil === 'admin' && (
          <TouchableOpacity
            style={styles.botaoNovo}
            onPress={abrirCadastro}
          >
            <Text style={styles.textoNovo}>
              + Novo agendamento
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (tela === 'detalhes') {

    return (
      <ScrollView style={styles.containerDetalhes} contentContainerStyle={{  paddingBottom: 30, }}>

        <View style={styles.headerDetalhes}>
          <TouchableOpacity
            onPress={() => setTela('lista')}
          >
            <Text style={styles.voltar}>
              ‹
            </Text>
          </TouchableOpacity>
          <Text style={styles.tituloDetalhes}>
            Detalhes
          </Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={styles.detalhesCard}>
          {agendamentoSelecionado.imagem ? (
            <Image
              source={{
                uri: agendamentoSelecionado.imagem,
              }}
              style={styles.imagemPet}
            />

          ) : (
            <View style={styles.imagemSemFoto}>
              <Text style={styles.imagemIcone}>
                🐶
              </Text>
              <Text style={styles.semFotoTexto}>
                Nenhuma imagem cadastrada
              </Text>
            </View>
          )}

          <Text style={styles.petDetalhes}>
            {agendamentoSelecionado.nomePet}
          </Text>
          <View style={styles.linhaDetalhe}>
            <Text style={styles.labelDetalhe}>
              Nome do Tutor
            </Text>
            <Text style={styles.valorDetalhe}>
              {agendamentoSelecionado.nomeTutor}
            </Text>
          </View>
          <View style={styles.linhaDetalhe}>
            <Text style={styles.labelDetalhe}>
              Servico
            </Text>
            <Text style={styles.valorDetalhe}>
              {agendamentoSelecionado.servico}
            </Text>
          </View>

          <View style={styles.linhaDetalhe}>
            <Text style={styles.labelDetalhe}>
              Data
            </Text>
            <Text style={styles.valorDetalhe}>
              {agendamentoSelecionado.data}
            </Text>
          </View>

          <View style={styles.linhaDetalhe}>

            <Text style={styles.labelDetalhe}>
              Horario
            </Text>
            <Text style={styles.valorDetalhe}>
              {agendamentoSelecionado.horario}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => setTela('lista')}
        >

          <Text style={styles.textoBotaoEscuro}>
            Voltar para a lista
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (tela === 'cadastro') {
    return (
      <ScrollView contentContainerStyle={styles.containerCadastro} showsVerticalScrollIndicator={false}>

        <View style={styles.headerCadastro}>
          <TouchableOpacity onPress={() => setTela('lista')} >
            <Text style={styles.voltar}>
              ‹
            </Text>
          </TouchableOpacity>
          <Text style={styles.tituloCadastro}>
            {editando ? 'Editar Agendamento'  : 'Novo Agendamento'}
          </Text>
        </View>
        <Text style={styles.subtituloCadastro}>
          Preencha os dados abaixo
        </Text>
        <Text style={styles.label}>
          Nome do Pet *
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Thor"
          placeholderTextColor={CORES.lavenderGrey}
          value={formulario.nomePet}
          onChangeText={(texto) =>
            setFormulario({
              ...formulario,
              nomePet: texto,
            })
          }
        />

        <Text style={styles.label}>
          Nome do Tutor *
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: João"
          placeholderTextColor={CORES.lavenderGrey}
          value={formulario.nomeTutor}
          onChangeText={(texto) =>
            setFormulario({
              ...formulario,
              nomeTutor: texto,
            })
          }
        />

        <Text style={styles.label}>
          Servico *
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Banho e Tosa"
          placeholderTextColor={CORES.lavenderGrey}
          value={formulario.servico}
          onChangeText={(texto) =>
            setFormulario({
              ...formulario,
              servico: texto,
            })
          }
        />

        <Text style={styles.label}>
          Data *
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 10/09/2026"
          placeholderTextColor={CORES.lavenderGrey}
          value={formulario.data}
          onChangeText={(texto) =>
            setFormulario({
              ...formulario,
              data: texto,
            })
          }
        />

        <Text style={styles.label}>
          Horario *
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 14:00"
          placeholderTextColor={CORES.lavenderGrey}
          value={formulario.horario}
          onChangeText={(texto) =>
            setFormulario({
              ...formulario,
              horario: texto,
            })
          }
        />
        <Text style={styles.label}>
          Imagem do Pet
        </Text>
        <TextInput
          style={styles.input}
          placeholder="URL da imagem"
          placeholderTextColor={CORES.lavenderGrey}
          value={formulario.imagem}
          onChangeText={(texto) =>
            setFormulario({
              ...formulario,
              imagem: texto,
            })
          }
          autoCapitalize="none"
        />
        
        {formulario.imagem ? (
          <Image
            source={{
              uri: formulario.imagem,
            }}
            style={styles.previewImagem}
          />

        ) : null}
        <TouchableOpacity style={styles.botaoSalvar} onPress={salvarAgendamento}
        >

          <Text style={styles.textoBotao}>
            {editando ? 'Salvar alterações' : 'Salvar agendamento'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoCancelar} onPress={() => setTela('lista')}>
          <Text style={styles.textoBotaoEscuro}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return null;
}


const styles = StyleSheet.create({
  containerPerfil: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: CORES.fundo,
  },

  logo: {
    fontSize: 65,
    textAlign: 'center',
    marginBottom: 10,
  },

  titulo: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    color: CORES.coolSteel,
  },

  tituloPet: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: CORES.coolSteel,
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 18,
    textAlign: 'center',
    color: CORES.lavenderGrey,
    marginBottom: 45,
  },

  instrucao: {
    fontSize: 17,
    textAlign: 'center',
    color: CORES.textoEscuro,
    marginBottom: 20,
  },

  instrucaoPet: {
    fontSize: 16,
    textAlign: 'center',
    color: CORES.textoEscuro,
    lineHeight: 23,
    marginBottom: 25,
  },

  botaoAdmin: {
    backgroundColor: CORES.aquamarine,
    padding: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  botaoUsuario: {
    backgroundColor: CORES.celadon,
    padding: 17,
    borderRadius: 14,
    alignItems: 'center',
  },

  botaoContinuar: {
    backgroundColor: CORES.aquamarine,
    padding: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },

  botaoVoltarPerfil: {
    backgroundColor: CORES.celadon,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },

  textoBotao: {
    color: CORES.textoEscuro,
    fontSize: 16,
    fontWeight: 'bold',
  },

  textoBotaoEscuro: {
    color: CORES.textoEscuro,
    fontSize: 16,
    fontWeight: 'bold',
  },

  rodape: {
    textAlign: 'center',
    color: CORES.lavenderGrey,
    marginTop: 50,
    fontSize: 13,
  },


  label: {
    color: CORES.textoEscuro,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },

  input: {
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.lavenderGrey,
    borderRadius: 11,
    padding: 14,
    fontSize: 16,
    color: CORES.textoEscuro,
  },


  containerLista: {
    flex: 1,
    backgroundColor: CORES.fundo,
    padding: 20,
  },

  header: {
    backgroundColor: CORES.powderBlue,
    marginHorizontal: -20,
    marginTop: -20,
    padding: 20,
    paddingTop: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  headerTitulo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: CORES.textoEscuro,
  },

  headerPerfil: {
    color: CORES.textoEscuro,
    marginTop: 4,
  },

  sair: {
    color: CORES.textoEscuro,
    fontWeight: 'bold',
  },

  lista: {
    flex: 1,
  },

  loading: {
    marginTop: 30,
  },

  card: {
    backgroundColor: CORES.branco,
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: CORES.borda,
    elevation: 2,
  },

  cardCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  fotoPet: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginRight: 13,
  },

  fotoPetSemImagem: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginRight: 13,
    backgroundColor: CORES.aquamarine,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconeSemImagem: {
    fontSize: 25,
  },

  dadosPet: {
    flex: 1,
  },

  pet: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CORES.coolSteel,
  },

  tutor: {
    color: CORES.lavenderGrey,
    marginTop: 3,
  },

  infoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EDF1F3',
    paddingTop: 10,
  },

  info: {
    color: CORES.textoEscuro,
    marginTop: 5,
  },

  acoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },

  botaoEditar: {
    flex: 1,
    backgroundColor: CORES.aquamarine,
    padding: 11,
    borderRadius: 9,
    alignItems: 'center',
  },

  botaoExcluir: {
    flex: 1,
    backgroundColor: CORES.lavenderGrey,
    padding: 11,
    borderRadius: 9,
    alignItems: 'center',
  },

  textoAcao: {
    color: CORES.textoEscuro,
    fontWeight: 'bold',
  },

  botaoNovo: {
    backgroundColor: CORES.aquamarine,
    padding: 17,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 12,
  },

  textoNovo: {
    color: CORES.textoEscuro,
    fontSize: 16,
    fontWeight: 'bold',
  },


  semAgendamento: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },

  semAgendamentoIcone: {
    fontSize: 50,
    marginBottom: 15,
  },

  vazioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CORES.coolSteel,
    textAlign: 'center',
  },

  vazioTexto: {
    color: CORES.lavenderGrey,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },

  containerDetalhes: {
    flex: 1,
    backgroundColor: CORES.fundo,
    padding: 20,
  },

  headerDetalhes: {
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  voltar: {
    fontSize: 38,
    color: CORES.coolSteel,
  },

  tituloDetalhes: {
    fontSize: 23,
    fontWeight: 'bold',
    color: CORES.textoEscuro,
  },

  detalhesCard: {
    backgroundColor: CORES.branco,
    borderRadius: 18,
    padding: 20,
    elevation: 2,
  },

  imagemPet: {
    width: '100%',
    height: 240,
    borderRadius: 15,
    marginBottom: 20,
    resizeMode: 'cover',
  },

  imagemSemFoto: {
    width: '100%',
    height: 240,
    borderRadius: 15,
    backgroundColor: CORES.powderBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  imagemIcone: {
    fontSize: 65,
  },

  semFotoTexto: {
    color: CORES.textoEscuro,
    marginTop: 8,
  },

  petDetalhes: {
    fontSize: 25,
    fontWeight: 'bold',
    color: CORES.coolSteel,
    marginBottom: 15,
  },

  linhaDetalhe: {
    borderTopWidth: 1,
    borderTopColor: '#E7EDF0',
    paddingVertical: 13,
  },

  labelDetalhe: {
    color: CORES.lavenderGrey,
    fontSize: 13,
  },

  valorDetalhe: {
    color: CORES.textoEscuro,
    fontSize: 16,
    marginTop: 4,
  },

  botaoVoltar: {
    backgroundColor: CORES.aquamarine,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },


  containerCadastro: {
    padding: 20,
    paddingTop: 45,
    backgroundColor: CORES.fundo,
  },

  headerCadastro: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  tituloCadastro: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CORES.textoEscuro,
    marginLeft: 10,
  },

  subtituloCadastro: {
    color: CORES.lavenderGrey,
    marginBottom: 20,
    marginLeft: 45,
  },

  previewImagem: {
    width: '100%',
    height: 180,
    borderRadius: 15,
    marginTop: 15,
    resizeMode: 'cover',
  },

  botaoSalvar: {
    backgroundColor: CORES.aquamarine,
    padding: 16,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 25,
  },

  botaoCancelar: {
    backgroundColor: CORES.celadon,
    padding: 16,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },

});