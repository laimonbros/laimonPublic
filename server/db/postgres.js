export default {
    connect(Sequelize) {
        return new Sequelize('postgres://cloud_user:WIrn7KKLtH12.@shubologur.beget.app:5432/default_db', {
            logging: false, /* (msg) => {//false
                console.log(`[Sequelize Log]: ${msg}`);
            },*/
        });
    }
};