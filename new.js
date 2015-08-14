var RSVP = require('rsvp');
var inquirer = require('inquirer');
var slug = require('slug');
var moment = require('moment');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

var mkdir = RSVP.denodeify(fs.mkdir);
var writeFile = RSVP.denodeify(fs.writeFile);

slug.defaults.mode = 'rfc3986';

function permalinkPath(permalink) {
  return path.join('src', permalink);
}

var questions = [
  {
    type: 'input',
    name: 'title',
    message: 'What is the title of your post?',
    validate: function(input) {
      if (input && input.length > 3) {
        return true;
      }

      return 'Title must be more than 3 characters';
    }
  },
  {
    type: 'input',
    name: 'permalink',
    message: 'Permalink',
    default: function(answers) { return slug(answers.title); },
    validate: function(input) {
      if (!/^[a-z0-9-]+$/i.test(input)) {
        return 'Invalid: must be lowercase letters, numbers, and dashes';
      }

      if (fs.existsSync(permalinkPath(input))) {
        return 'Already exists';
      }

      return true;
    }
  },
  {
    type: 'input',
    name: 'excerpt',
    message: 'Write a quick one-line excerpt (or leave blank for now)',
    default: ''
  },
  {
    type: 'input',
    name: 'date',
    message: 'Date',
    default: function() { return moment().format('YYYY-MM-DD'); }
  },
  {
    type: 'confirm',
    name: 'unlisted',
    message: 'Should the post be unlisted for now?',
    default: true
  }
];

inquirer.prompt(questions, function(answers) {
  var data = {
    date: answers.date,
    title: answers.title,
    excerpt: answers.excerpt.toString(),
  };

  if (answers.unlisted) {
    data.unlisted = true;
  }

  var permalink = permalinkPath(answers.permalink);
  var datafile = path.join(permalink, 'data.json');
  var indexfile = path.join(permalink, 'index.md');

  mkdir(permalink).then(function() {
    var json = JSON.stringify(data, null, 2) + '\n';

    return writeFile(datafile, json);
  }).then(function() {
    var content = 'Your post goes here!\n';

    return writeFile(indexfile, content);
  }).then(function() {
    console.log(chalk.green('\nAll done!\n'));
    console.log('Data:', chalk.yellow(datafile));
    console.log('Post:', chalk.yellow(indexfile), '\n');
  }).catch(function(e) {
    console.error(chalk.red('ERROR: '), 'Failed to create the new post:',
                  e.message);
  });
});
