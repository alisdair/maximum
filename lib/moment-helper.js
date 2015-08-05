var handlebars = require('handlebars');
var moment = require('moment');

handlebars.registerHelper('moment', function(date, format) {
    return moment(date).format(format);
});
