const sqlite3 = require("sqlite3");
const { Sequelize, DataTypes } = require('sequelize');
const shortid = require('shortid');
const generaToken = () => shortid.generate();

const Database = async (path) => {
    try {

        const sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: path,
            logging: (sql) => {
              //  console.log(sql); //<-- per visualizzare in console le query sql che esegue
            }
        });

        const User = sequelize.define('User', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            email: DataTypes.STRING,
            password: DataTypes.STRING,
        }, {
            timestamps: false
        });
        const Data = sequelize.define('Data', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            key: DataTypes.STRING,
            value: DataTypes.TEXT,
            idUser: DataTypes.INTEGER
        }, {
            timestamps: false
        });

        await sequelize.sync();

        const getData = async (email, key) => {
            try {
                let idUser = await User.findOne({
                    where: {
                        email: email
                    }
                })
                if (idUser) {
                    idUser = idUser.id;
                    const data = await Data.findOne({
                        where: {
                            idUser: idUser,
                            key: key
                        }
                    })
                    return { result: data || [] };
                } else {
                    return { result: "Email non valida" };
                }
            } catch (e) {
                throw (e);
            }
        }
        const insertData = async (email, key, val) => {
            try {
                const user = await User.findOne({ where: { email: email } });
                if (user) {
                    const existingData = await Data.findOne({ where: { idUser: user.id, key: key } });
                    if (existingData) {
                        let value = JSON.parse(existingData.dataValues.value);
                        value.push(val);
                        value = JSON.stringify(value);
                        await existingData.update({ value: value });
                        return { result: "Dato modificato con successo" };
                    } else {
                        let temp = [];
                        temp.push(val);
                        temp = JSON.stringify(temp);
                        console.log(temp);
                        await Data.create({ key: key, value: temp, idUser: user.id });
                        return { result: "Dato inserito con successo" };
                    }
                } else {
                    return { result: "Token non valido" };
                }
            } catch (e) {
                throw (e);
            }
        }
      //servizio modificapassword
        const register = async (email, password) => {
            try {
                let user = await User.findOne({
                    where: {
                        email: email
                    }
                });
                if (user) {
                  return { result: "Utente già registrato" };
                } else {
                    await User.create({
                        email: email,
                        password: password
                    })
                   return { result: "Registrazione avvenuta con successo, vai alla pagina di login" };
                }
               
            } catch (e) {
                throw (e);
            }
        }

        const getUser = async (email) =>{
          try {
            const users = await User.findAll({
                where: {
                    email: {
                        [Sequelize.Op.ne]: email // Op.ne sta per "not equal"
                    }
                }
            });
            const dizionario = [];
            users.forEach(user  =>{
              dizionario.push(user.email);
            })
            return { result: dizionario };
          } catch (e) {
              throw (e);
          }
        }
        const login = async (email, token) => {
            try {
                let user = await User.findOne({
                    where: {
                        email: email,
                        password: token
                    }
                });
                if (user != {} && user) {
                    return { login: true };
                } else {
                    return { login: false };
                }
            } catch (e) {
                throw (e);
            }
        }
        const completeEvent = async (email, id) => {
            try {
                const user = await User.findOne({
                    where: {
                        email: email
                    }
                });
                if (!user) {
                    return { login: "Utente non trovato" };
                }
                const evento = await Data.findOne({
                    where: {
                        key: "eventi",
                        idUser: user.id
                    }
                });
                if (!evento) {
                    return { login: "Evento non trovato" };
                }
                const eventoTemp = JSON.parse(evento.value);
                if (!eventoTemp[id]) {
                    return { login: "Evento non trovato" };
                }
                eventoTemp[id] = JSON.parse(eventoTemp[id]);
                eventoTemp[id]['completato'] = true;
                eventoTemp[id] = JSON.stringify(eventoTemp[id]);
                await Data.update({ value: JSON.stringify(eventoTemp) }, {
                    where: {
                        key: "eventi",
                        idUser: user.id
                    }
                });
                return { success: true, message: "Evento completato con successo" };
            } catch (e) {
                throw e;
            }
        };
        const deleteEvent = async (email, id) => {
            try {
                const user = await User.findOne({
                    where: {
                        email: email
                    }
                });
                if (!user) {
                    return { login: "Utente non trovato" };
                }
                const evento = await Data.findOne({
                    where: {
                        key: "eventi",
                        idUser: user.id
                    }
                });
                if (!evento) {
                    return { login: "Evento non trovato" };
                }
                let eventoTemp = JSON.parse(evento.value);
                if (!eventoTemp[id]) {
                    return { login: "Evento non trovato" };
                }
                // Rimuovi l'evento dall'oggetto eventoTemp
                delete eventoTemp[id];
                // Filtra gli elementi nulli dall'array
                eventoTemp = eventoTemp.filter(element => element != null && element);
                // Aggiorna il valore JSON dell'evento nel database senza l'evento eliminato
                await Data.update({ value: JSON.stringify(eventoTemp) }, {
                    where: {
                        key: "eventi",
                        idUser: user.id
                    }
                });
                return { success: true, message: "Evento eliminato con successo" };
            } catch (e) {
                throw e;
            }
        };
        
        
        return {
            getData: getData,
            insertData: insertData,
            register: register,
            login: login,
            getUser: getUser,
            completeEvent: completeEvent,
            deleteEvent: deleteEvent
        }
    } catch (e) {
        throw (e);
    }
}

module.exports = Database;