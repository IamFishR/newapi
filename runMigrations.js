require('dotenv').config();
const { exec } = require('child_process');

exec('npx sequelize-cli db:migrate --env development --config config/sequelize.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});