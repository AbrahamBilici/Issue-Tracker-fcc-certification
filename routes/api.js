'use strict';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI);


const IssueSchema = new mongoose.Schema({
  assigned_to: { type: String, default: "" },
  status_text: { type: String, default: "" },
  open: { type: Boolean, default: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now }
}, { versionKey: false });


const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issues: [IssueSchema]
}, { versionKey: false })


const ProjectIssueTrackerFCC = mongoose.model('ProjectIssueTrackerFCC', ProjectSchema);


module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async (req, res) => {
      const { project } = req.params;
      let filters = req.query;

      try {



        const projectData = await ProjectIssueTrackerFCC.findOne({ name: project });
        if (!projectData) {
          return res.json([]);
        }

        let issues = projectData.issues;

        Object.keys(filters).forEach((field) => {
          const filterValue = filters[field];
          issues = issues.filter((issue) => {
            return issue[field].toString().toLowerCase() === filterValue.toString().toLowerCase();
          });
        });

        return res.json(issues);


      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }




    })

    .post(async (req, res) => {
      const { project } = req.params
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;



      try {

        if (!issue_text || !issue_title || !created_by) {
          return res.json({ error: 'required field(s) missing' });

        }

        const newIssue = {
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          issue_title,
          issue_text,
          created_by,
          created_on: new Date(),
          updated_on: new Date(),
        }

        const projectData = await ProjectIssueTrackerFCC.findOneAndUpdate(
          { name: project },
          { $push: { issues: newIssue } },
          { new: true }
        );

        if (!projectData) {
          const newProject = new ProjectIssueTrackerFCC({
            name: project,
            issues: [newIssue]
          });
          await newProject.save();
          return res.json(newProject.issues[0])
        };

        return res.json(projectData.issues[projectData.issues.length - 1])



      } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' })
      }




    })

    .put(async (req, res) => {
      const { project } = req.params;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

      try {

        if (!_id) {
          return res.json({ error: 'missing _id' });

        }

        if (!ObjectId.isValid(_id)) {
          return res.json({ error: 'could not update', '_id': _id });
        }

        if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
          return res.json({ error: 'no update field(s) sent', _id });
        }


        const projectData = await ProjectIssueTrackerFCC.findOne({ name: project });

        if (!projectData) {
          return res.json({ error: 'could not update', '_id': _id });
        }


        const issue = projectData.issues.find((issue) => issue['_id'].toString() === _id);

        if (!issue) {
          return res.json({ error: 'could not update', '_id': _id });
        }

        const issueID = issue['_id'];
        const update = {
          _id: issueID,
          issue_title: issue_title || issue.issue_title,
          issue_text: issue_text || issue.issue_text,
          created_by: created_by || issue.created_by,
          assigned_to: assigned_to,
          status_text: status_text,
          updated_on: new Date(),
          open: open ? false : issue.open,
          created_on: issue.created_on
        };
        const save = await ProjectIssueTrackerFCC.findOneAndUpdate(
          { "issues._id": issueID },
          { $set: { "issues.$": update } },
          { new: true }
        );


        if (!save) {
          return res.json({ error: 'could not update', '_id': _id });
        }

        return res.status(200).json({ result: 'successfully updated', '_id': _id });


      } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' })
      }

    })

    .delete(async (req, res) => {
      const { project } = req.params;
      const { _id } = req.body;

      try {

        if (!_id) {
          return res.json({ error: 'missing _id' })
        }

        if (!ObjectId.isValid(_id)) {
          return res.json({ error: 'could not delete', '_id': _id });
        }

        const projectData = await ProjectIssueTrackerFCC.findOne({ name: project });
        if (!projectData) {
          return res.json({ error: 'could not delete', '_id': _id })
        }


        const issueIndex = projectData.issues.findIndex(issue => issue._id.toString() === _id);
        if (issueIndex === -1) {
          return res.json({ error: 'could not delete', '_id': _id });
        }

        projectData.issues.splice(issueIndex, 1);
        await projectData.save();

        res.json({ result: 'successfully deleted', '_id': _id });


      } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' })
      }

    });

};
