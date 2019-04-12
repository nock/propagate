var test = require('tap').test
var EventEmitter = require('events').EventEmitter
var propagate = require('..')
var http = require('http')

test('is able to propagate response from http.ClientRequest', function(t) {
  t.plan(1)

  var request = http.request({
    hostname: 'google.com',
    path: '/',
    method: 'GET',
  })

  var ee1 = new EventEmitter()

  propagate(request, ee1)

  var retrievedData = ''
  ee1.on('response', response => {
    response.on('data', data => {
      retrievedData = data.toString('utf8')
    })

    response.on('close', () => {
      t.notEqual(retrievedData, '')
    })
  })

  request.end()
})
