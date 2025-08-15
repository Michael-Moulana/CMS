const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const sinon = require("sinon");
const Page = require("../models/Page");
const {
  createPage,
  getPages,
  getPage,
  updatePage,
  deletePage,
} = require("../controllers/pageController");
const { expect } = chai;

chai.use(chaiHttp);

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

// describe("Get Single Page Function Test", () => {
//   let findByIdStub;

//   afterEach(() => {
//     if (findByIdStub) findByIdStub.restore();
//   });

//   it("should return a page successfully", async () => {
//     const pageId = new mongoose.Types.ObjectId();
//     const page = {
//       _id: pageId,
//       title: "Sample Page",
//       content: "Sample content",
//     };

//     findByIdStub = sinon.stub(Page, "findById").resolves(page);

//     const req = { params: { id: pageId.toString() } };
//     const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

//     await getPage(req, res);

//     expect(findByIdStub.calledOnceWith(pageId.toString())).to.be.true;
//     expect(res.status.calledWith(200)).to.be.true;
//     expect(res.json.calledWith(page)).to.be.true;
//   });

//   it("should return 404 if page is not found", async () => {
//     findByIdStub = sinon.stub(Page, "findById").resolves(null);

//     const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
//     const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

//     await getPage(req, res);

//     expect(res.status.calledWith(404)).to.be.true;
//     expect(res.json.calledWith({ message: "Page not found" })).to.be.true;
//   });

//   it("should return 500 if an error occurs", async () => {
//     findByIdStub = sinon.stub(Page, "findById").rejects(new Error("DB Error"));

//     const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
//     const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

//     await getPage(req, res);

//     expect(res.status.calledWith(500)).to.be.true;
//     expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;
//   });
// });

describe("Update Page Function Test", () => {
  it("should update page successfully", async () => {
    const pageId = new mongoose.Types.ObjectId();
    const updatedPage = {
      _id: pageId,
      title: "New Page",
      content: "Updated Content",
    };

    const findByIdAndUpdateStub = sinon
      .stub(Page, "findByIdAndUpdate")
      .resolves(updatedPage);

    const req = {
      params: { id: pageId },
      body: { title: "New Page", content: "Updated Content" },
    };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await updatePage(req, res);

    expect(
      findByIdAndUpdateStub.calledOnceWith(
        pageId,
        {
          title: "New Page",
          content: "Updated Content",
          updatedAt: sinon.match.number,
        },
        { new: true }
      )
    ).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: "Page updated", page: updatedPage }))
      .to.be.true;

    findByIdAndUpdateStub.restore();
  });

  it("should return 404 if page is not found", async () => {
    const findByIdAndUpdateStub = sinon
      .stub(Page, "findByIdAndUpdate")
      .resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updatePage(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: "Page not found" })).to.be.true;

    findByIdAndUpdateStub.restore();
  });

  it("should return 500 on error", async () => {
    const findByIdAndUpdateStub = sinon
      .stub(Page, "findByIdAndUpdate")
      .throws(new Error("DB Error"));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updatePage(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;

    findByIdAndUpdateStub.restore();
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
