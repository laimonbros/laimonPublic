export default {
    connect(Sequelize) {
        return new Sequelize({
            dialect: 'sqlite', // Show SQLite as dialect 
            storage: ':memory:', // Show in-memory mode
            logging: (msg) => {//false
                console.log(`[Sequelize Log]: ${msg}`);
            },
        });
    }
};
