// I checked this in by accident. I'm ambivalent about whether we ought to
// include it. It's a reproduction of the bug from https://github.com/nock/propagate/pull/17
// though it doesn't elucidate the fix as well as directly testing the return
// values from .emit()

'use strict'

const { test } = require('tap')
const { EventEmitter } = require('events')
const propagate = require('..')
const http = require('http')

test('is able to propagate response from http.ClientRequest', function(t) {
  t.plan(1)

  const request = http.request({
    hostname: 'google.com',
    path: '/',
    method: 'GET',
  })

  const ee1 = new EventEmitter()

  propagate(request, ee1)

  let retrievedData = ''
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
