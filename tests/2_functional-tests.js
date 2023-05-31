const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    test('Create an issue with every field with POST', (done) => {
        chai.request(server)
            .post('/api/issues/apitest')
            .send({
                assigned_to: 'John',
                status_text: 'In progress',
                issue_title: 'Test Issue',
                issue_text: 'This is a test issue',
                created_by: 'Abraham'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.assigned_to, 'John');
                assert.equal(res.body.status_text, 'In progress');
                assert.equal(res.body.issue_title, 'Test Issue');
                assert.equal(res.body.issue_text, 'This is a test issue');
                assert.equal(res.body.created_by, 'Abraham');
                done();
            });
    });

    test('Create an issue with only required fields with POST', (done) => {
        chai.request(server)
            .post('/api/issues/apitest')
            .send({
                issue_title: 'Required Field Test',
                issue_text: 'This is a test with only required fields',
                created_by: 'Ingrid'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, 'Required Field Test');
                assert.equal(res.body.issue_text, 'This is a test with only required fields');
                assert.equal(res.body.created_by, 'Ingrid');
                done();
            });
    });

    test('Create an issue with missing required fields with POST', (done) => {
        chai.request(server)
            .post('/api/issues/apitest')
            .send({})
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res.body, 'error');
                assert.equal(res.body.error, 'required field(s) missing');
                done();
            });
    });

    test('View issues on a project with GET', (done) => {
        chai.request(server)
            .get('/api/issues/apitest')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    });

    test('View issues on a project with one filter with GET', (done) => {
        chai.request(server)
            .get('/api/issues/apitest?open=true')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    });

    test('View issues on a project with multiple filters with GET', (done) => {
        chai.request(server)
            .get('/api/issues/apitest?open=true&created_by=ingrid')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    });

    test('Update one field on an issue with PUT', (done) => {
        chai.request(server)
            .put('/api/issues/apitest')
            .send({
                _id: '6477908b8f72b9c516bcdd64',
                assigned_to: 'New Assignee'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, '6477908b8f72b9c516bcdd64');
                done();
            });
    });

    test('Update multiple fields on an issue with PUT', (done) => {
        chai.request(server)
            .put('/api/issues/apitest')
            .send({
                _id: '647790748f72b9c516bcdd4d',
                assigned_to: 'New Assignee',
                created_by: 'IngridJimenez',
                issue_text: "my husband testing his codes"
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, '647790748f72b9c516bcdd4d');
                done();
            });
    });

    test('Update an issue with missing _id with PUT', (done) => {
        chai.request(server)
            .put('/api/issues/apitest')
            .send({
                assigned_to: 'New Assignee',
                created_by: 'Ingr',
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res.body, 'error');
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    });

    test('Update an issue with no fields to update with PUT', (done) => {
        chai.request(server)
            .put('/api/issues/apitest')
            .send({
                _id: '647792188043c972e5872693'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res.body, 'error');
                assert.equal(res.body.error, 'no update field(s) sent');
                assert.equal(res.body._id, '647792188043c972e5872693');
                done();
            });
    });

    test('Update an issue with an invalid _id with PUT', (done) => {
        chai.request(server)
            .put('/api/issues/apitest')
            .send({
                _id: '647700008043c972e5877773',
                assigned_to: 'New Assignee',
                created_by: 'Ingr',
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res.body, 'error');
                assert.equal(res.body.error, 'could not update');
                assert.equal(res.body._id, '647700008043c972e5877773');
                done();
            });
    });

    test('Delete an issue with DELETE', (done) => {
        chai.request(server)
            .delete('/api/issues/apitest')
            .send({
                _id: '64779475e57c09b6a140c404'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully deleted');
                assert.equal(res.body._id, '64779475e57c09b6a140c404');
                done();
            });
    });

    test('Delete an issue with an invalid _id with DELETE', (done) => {
        chai.request(server)
            .delete('/api/issues/apitest')
            .send({
                _id: '55555563e57c09b6a140c3de'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res.body, 'error');
                assert.equal(res.body.error, 'could not delete');
                assert.equal(res.body._id, '55555563e57c09b6a140c3de');
                done();
            });
    });

    test('Delete an issue with missing _id with DELETE', (done) => {
        chai.request(server)
            .delete('/api/issues/apitest')
            .send({})
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    });







});
