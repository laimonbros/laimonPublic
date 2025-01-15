export default {
    connect(Sequelize) {
        return new Sequelize('INSERTPOSTGRESHERE', {
            logging: false, /* (msg) => {//false
                console.log(`[Sequelize Log]: ${msg}`);
            },*/
        });
    }
};
