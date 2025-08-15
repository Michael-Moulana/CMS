const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const sinon = require("sinon");
const Page = require("../models/Page");
const Navigation = require("../models/navigation");
const {
  createPage,
  getPages,
  updatePage,
  deletePage,
} = require("../controllers/pageController");

const {
  createNavigation,
  getNavigations,
} = require("../controllers/navigationController");

const { expect } = chai;

chai.use(chaiHttp);

describe("Get Navigations Function Test", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { _id: new mongoose.Types.ObjectId() } };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return all navigations for the user", async () => {
    const navigations = [
      { _id: new mongoose.Types.ObjectId(), title: "Nav 1" },
      { _id: new mongoose.Types.ObjectId(), title: "Nav 2" },
    ];

    const findStub = sinon.stub(Navigation, "find").returns({
      sort: sinon.stub().returnsThis(),
      populate: sinon.stub().resolves(navigations),
    });

    await getNavigations(req, res);

    expect(findStub.calledOnceWith({ createdBy: req.user._id })).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ navigation: navigations })).to.be.true;
  });

  it("should return 500 on error", async () => {
    const error = new Error("DB Error");
    const findStub = sinon.stub(Navigation, "find").returns({
      sort: sinon.stub().returnsThis(),
      populate: sinon.stub().throws(error),
    });

    await getNavigations(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;
  });
});

describe("Create Navigation Function Test", function () {
  this.timeout(5000); // Increase timeout for async operations

  afterEach(() => {
    sinon.restore();
  });

  it("should create a new navigation item successfully", async () => {
    const req = {
      body: {
        title: "Main Menu",
        slug: "main-menu",
        order: 1,
        parent: null,
      },
      user: { _id: new mongoose.Types.ObjectId() }, // auth middleware
    };

    const savedNav = {
      _id: new mongoose.Types.ObjectId(),
      ...req.body,
      createdBy: req.user._id,
    };

    // Stub Navigation.findOne to simulate slug check
    const findOneStub = sinon.stub(Navigation, "findOne").resolves(null);

    // Stub Navigation.prototype.save to simulate DB save
    const saveStub = sinon
      .stub(Navigation.prototype, "save")
      .resolves(savedNav);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createNavigation(req, res);

    expect(findOneStub.calledOnceWithExactly({ slug: req.body.slug })).to.be
      .true;
    expect(saveStub.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(
      res.json.calledWith({
        message: "Navigation item created successfully",
        navigation: savedNav,
      })
    ).to.be.true;
  });

  it("should return 400 if title or slug is missing", async () => {
    const req = {
      body: { title: "" },
      user: { _id: new mongoose.Types.ObjectId() },
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await createNavigation(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ error: "Title and slug are required" })).to.be
      .true;
  });

  it("should return 400 if slug already exists", async () => {
    const req = {
      body: { title: "Menu", slug: "main-menu" },
      user: { _id: new mongoose.Types.ObjectId() },
    };

    // Stub Navigation.findOne to return existing nav
    sinon
      .stub(Navigation, "findOne")
      .resolves({ _id: new mongoose.Types.ObjectId() });

    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await createNavigation(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ error: "Slug already exists" })).to.be.true;
  });

  it("should return 500 if DB save fails", async () => {
    const req = {
      body: { title: "Main Menu", slug: "main-menu" },
      user: { _id: new mongoose.Types.ObjectId() },
    };

    sinon.stub(Navigation, "findOne").resolves(null);
    sinon.stub(Navigation.prototype, "save").rejects(new Error("DB Error"));

    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await createNavigation(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ error: "Server error" })).to.be.true;
  });
});

describe("Create Page Function Test", () => {
  it("should create a new page successfully", async () => {
    const req = {
      body: { title: "New Page", content: "Page content" },
    };

    const createdPage = {
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      content: req.body.content,
      slug: "new-page",
    };

    const saveStub = sinon.stub(Page.prototype, "save").resolves(createdPage);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createPage(req, res);

    expect(saveStub.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith({ message: "Page created", page: createdPage }))
      .to.be.true;

    saveStub.restore();
  });

  it("should return 500 if an error occurs", async () => {
    const saveStub = sinon
      .stub(Page.prototype, "save")
      .rejects(new Error("DB Error"));

    const req = { body: { title: "New Page", content: "Page content" } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await createPage(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;

    saveStub.restore();
  });
});

describe("Update Page Function Test", function () {
  this.timeout(5000); // avoid timeout issues

  afterEach(() => {
    sinon.restore();
  });

  it("should update page successfully", async () => {
    const pageId = new mongoose.Types.ObjectId();
    const updatedPage = {
      _id: pageId,
      title: "New Page",
      content: "Updated Content",
      slug: "new-page",
      updatedAt: new Date(),
    };

    const findByIdAndUpdateStub = sinon
      .stub(Page, "findByIdAndUpdate")
      .resolves(updatedPage);

    const req = {
      params: { id: pageId },
      body: { title: "New Page", content: "Updated Content", slug: "new-page" },
    };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await updatePage(req, res);

    expect(
      findByIdAndUpdateStub.calledOnceWith(
        pageId,
        {
          title: "New Page",
          content: "Updated Content",
          slug: "new-page",
          updatedAt: sinon.match.number, // allow number timestamp
        },
        { new: true }
      )
    ).to.be.true;

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: "Page updated", page: updatedPage }))
      .to.be.true;
  });

  it("should return 404 if page is not found", async () => {
    sinon.stub(Page, "findByIdAndUpdate").resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updatePage(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: "Page not found" })).to.be.true;
  });

  it("should return 500 on error", async () => {
    sinon.stub(Page, "findByIdAndUpdate").throws(new Error("DB Error"));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updatePage(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;
  });
});

describe("Get Pages Function Test", () => {
  it("should return all pages", async () => {
    const pages = [
      { _id: new mongoose.Types.ObjectId(), title: "Page 1" },
      { _id: new mongoose.Types.ObjectId(), title: "Page 2" },
    ];

    const findStub = sinon.stub(Page, "find").resolves(pages);

    const req = {};
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await getPages(req, res);

    expect(findStub.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(pages)).to.be.true;

    findStub.restore();
  });

  it("should return 500 on error", async () => {
    const findStub = sinon.stub(Page, "find").throws(new Error("DB Error"));

    const req = {};
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await getPages(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;

    findStub.restore();
  });
});

describe("Delete Page Function Test", () => {
  it("should delete a page successfully", async () => {
    const pageId = new mongoose.Types.ObjectId().toString();
    const page = { _id: pageId };

    const findByIdAndDeleteStub = sinon
      .stub(Page, "findByIdAndDelete")
      .resolves(page);

    const req = { params: { id: pageId } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deletePage(req, res);

    expect(findByIdAndDeleteStub.calledOnceWith(pageId)).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: "Page deleted" })).to.be.true;

    findByIdAndDeleteStub.restore();
  });

  it("should return 404 if page is not found", async () => {
    const findByIdAndDeleteStub = sinon
      .stub(Page, "findByIdAndDelete")
      .resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deletePage(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: "Page not found" })).to.be.true;

    findByIdAndDeleteStub.restore();
  });

  it("should return 500 if an error occurs", async () => {
    const findByIdAndDeleteStub = sinon
      .stub(Page, "findByIdAndDelete")
      .throws(new Error("DB Error"));

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deletePage(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;

    findByIdAndDeleteStub.restore();
  });
});
