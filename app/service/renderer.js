const fs = require('fs')

window.onload = () => {
    fs.readFile(`${__dirname}/../view/dashboard.html`, (err, data) => {
        console.log(err);
        console.log(data);
        document.getElementById('content').innerHTML = data;
    });
}