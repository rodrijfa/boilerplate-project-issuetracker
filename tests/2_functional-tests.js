const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const assert = chai.assert;

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let testId;

  suite('Issue Tests', function() {

    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/testproject')
        .send({
          issue_title: 'Test title',
          issue_text: 'Test text',
          created_by: 'Tester',
          assigned_to: 'Dev',
          status_text: 'In QA'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.equal(res.body.issue_title, 'Test title');
          assert.equal(res.body.assigned_to, 'Dev');
          testId = res.body._id;
          done();
        });
    });

    test('Create an issue with only required fields', function(done) {
      chai.request(server)
        .post('/api/issues/testproject')
        .send({
          issue_title: 'Required only',
          issue_text: 'Required text',
          created_by: 'Tester'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          done();
        });
    });

    test('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/testproject')
        .send({
          issue_title: '',
          issue_text: '',
          created_by: ''
        })
        .end(function(err, res) {
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });

    test('View issues on a project', function(done) {
      chai.request(server)
        .get('/api/issues/testproject')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues on a project with one filter', function(done) {
      chai.request(server)
        .get('/api/issues/testproject?open=true')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues on a project with multiple filters', function(done) {
      chai.request(server)
        .get('/api/issues/testproject?open=true&created_by=Tester')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('Update one field on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/testproject')
        .send({
          _id: testId,
          issue_text: 'Updated text'
        })
        .end(function(err, res) {
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testId);
          done();
        });
    });

    test('Update multiple fields on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/testproject')
        .send({
          _id: testId,
          issue_title: 'Updated title',
          assigned_to: 'New Dev'
        })
        .end(function(err, res) {
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    test('Update an issue with missing _id', function(done) {
      chai.request(server)
        .put('/api/issues/testproject')
        .send({
          issue_title: 'No id'
        })
        .end(function(err, res) {
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Update an issue with no fields to update', function(done) {
      chai.request(server)
        .put('/api/issues/testproject')
        .send({
          _id: testId
        })
        .end(function(err, res) {
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });

    test('Update an issue with an invalid _id', function(done) {
      chai.request(server)
        .put('/api/issues/testproject')
        .send({
          _id: 'invalidid123',
          issue_text: 'fail'
        })
        .end(function(err, res) {
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });

    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/api/issues/testproject')
        .send({
          _id: testId
        })
        .end(function(err, res) {
          assert.equal(res.body.result, 'successfully deleted');
          done();
        });
    });

    test('Delete an issue with an invalid _id', function(done) {
      chai.request(server)
        .delete('/api/issues/testproject')
        .send({
          _id: 'invalidid123'
        })
        .end(function(err, res) {
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });

    test('Delete an issue with missing _id', function(done) {
      chai.request(server)
        .delete('/api/issues/testproject')
        .send({})
        .end(function(err, res) {
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

  });

});
