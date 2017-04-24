'use strict';

const _ = require('lodash@4.8.2')
const request = require('request@2.67.0');

const verbMap = {
  create: 'created',
  update: 'updated',
  sync: 'uploaded',
  complete: 'is available for'
};
const phraseMap = {
  project: 'a project named',
  interview: 'an interview with',
  transcript: 'an interview with'
};

/*
  Context data could contain:
  - subject: name of user or thing that triggered the event
  - action: type of event (see list above)
  - model: type of model for event (see list above)
  - object: name of object
  - link: url for direct access to object (optional)
  - webhook: custom webhook address to send message (optional)
    - e.g. https://hooks.slack.com/services/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
*/
module.exports = (context, cb) => {
  const data = context.data;
  console.log('Received data:', context.data);

  const verb = verbMap[_.toLower(data.action)];
  const phrase = phraseMap[_.toLower(data.model)];
  const url = data.webhook || context.secrets.webhook;
  console.log(verb, phrase, url);

  if (!data.subject || !verb || !url) {
    return cb(new Error('Bad data'));
  }

  // format message for Slack
  let text = `${data.subject} ${verb} ${phrase}`;
  if (data.link) {
    text += ` <${data.link}|${data.object}>`;
  } else if (data.object) {
    text += ` ${data.object}`;
  }

  request.post({
    url,
    json: { text }
  }, (err, r, body) => {
    console.log('Processed HTTP response', err || 'successfully');
    cb(err, body);
  });
};
