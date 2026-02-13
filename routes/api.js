'use strict';

const Issue = require('../models'); // porque exportas directamente el modelo

module.exports = function (app) {

  app.route('/api/issues/:project')

    // ========================
    // GET
    // ========================
    .get(async function (req, res) {
      const project = req.params.project;
      const query = req.query;

      try {
        const filter = { project, ...query };
        const issues = await Issue.find(filter);
        res.json(issues);
      } catch (err) {
        res.json({ error: 'could not retrieve issues' });
      }
    })

    // ========================
    // POST
    // ========================
    .post(async function (req, res) {

      const project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        const newIssue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        });

        const savedIssue = await newIssue.save();
        res.json(savedIssue);

      } catch (err) {
        res.json({ error: 'could not create issue' });
      }
    })

    // ========================
    // PUT
    // ========================
    .put(async function (req, res) {

      const { _id, ...fieldsToUpdate } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // eliminar campos vacíos
      Object.keys(fieldsToUpdate).forEach(key => {
        if (fieldsToUpdate[key] === '') {
          delete fieldsToUpdate[key];
        }
      });

      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      fieldsToUpdate.updated_on = new Date();

      try {
        const updated = await Issue.findByIdAndUpdate(
          _id,
          fieldsToUpdate,
          { returnDocument: 'after' }
        );

        if (!updated) {
          return res.json({ error: 'could not update', _id });
        }

        res.json({ result: 'successfully updated', _id });

      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })

    // ========================
    // DELETE
    // ========================
    .delete(async function (req, res) {

      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      try {
        const deleted = await Issue.findByIdAndDelete(_id);

        if (!deleted) {
          return res.json({ error: 'could not delete', _id });
        }

        res.json({ result: 'successfully deleted', _id });

      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });

};
