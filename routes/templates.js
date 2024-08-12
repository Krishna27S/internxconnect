const express = require('express');
const JobTemplate = require('../models/jobTemplate'); // Updated path for job template schema

const router = express.Router();

router.get("/", async (req, res) => {
    const templates = await JobTemplate.find({ createdBy: req.user._id });
    res.render("templates", { templates });
});

router.get("/new", (req, res) => {
    res.render("newTemplate");
});

router.post("/", async (req, res) => {
    const newTemplate = new JobTemplate({
        title: req.body.title,
        description: req.body.description,
        requirements: req.body.requirements,
        createdBy: req.user._id
    });

    await newTemplate.save();
    res.redirect("/templates");
});

router.get("/:id/edit", async (req, res) => {
    const template = await JobTemplate.findById(req.params.id);
    if (template.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).send("Forbidden");
    }
    res.render("editTemplate", { template });
});

router.post("/:id", async (req, res) => {
    const template = await JobTemplate.findById(req.params.id);
    if (template.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).send("Forbidden");
    }

    template.title = req.body.title;
    template.description = req.body.description;
    template.requirements = req.body.requirements;
    await template.save();

    res.redirect("/templates");
});

router.post("/:id/delete", async (req, res) => {
    const template = await JobTemplate.findById(req.params.id);
    if (template.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).send("Forbidden");
    }

    await template.remove();
    res.redirect("/templates");
});

module.exports = router;
