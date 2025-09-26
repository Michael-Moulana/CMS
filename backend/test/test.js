const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const Page = require("../models/Page");
const Navigation = require("../models/NavigationModel");

const ModelFactory = require("../services/ModelFactory");
const AuthProxy = require("../services/AuthProxy");
const ResponseDecorator = require("../services/ResponseDecorator");

const {
  createProduct,
  deleteProduct,
  addMediaToProduct,
} = require("../controllers/productController");

const {
  createPage,
  getPages,
  updatePage,
  deletePage,
} = require("../controllers/pageController");

const {
  createNavigation,
  getNavigations,
  updateNavigation,
  deleteNavigation,
} = require("../controllers/navigationController");

const { expect } = chai;

chai.use(chaiHttp);

describe("getAllProducts Controller", () => {
  let req, res, next, productManagerStub, getAllProducts;

  beforeEach(() => {
    req = {};
    res = { json: sinon.stub() };
    next = sinon.spy();

    productManagerStub = { getAll: sinon.stub() };

    // Use proxyquire to replace ModelFactory.createProductManager
    const productController = proxyquire("../controllers/productController", {
      "../services/ModelFactory": {
        createProductManager: () => productManagerStub,
      },
      "../services/ResponseDecorator": ResponseDecorator,
    });

    getAllProducts = productController.getAllProducts;

    // Stub ResponseDecorator.decorate
    sinon.stub(ResponseDecorator, "decorate").callsFake((data, msg) => ({
      success: true,
      message: msg,
      data,
    }));
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should fetch all products and return decorated response", async () => {
    const fakeProducts = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Cool Sneakers",
        description: "High quality sneakers",
        price: 79.99,
        stock: 20,
        categories: ["footwear", "sports"],
        media: [],
        createdBy: new mongoose.Types.ObjectId(),
      },
    ];

    productManagerStub.getAll.resolves(fakeProducts);

    await getAllProducts(req, res, next);

    expect(productManagerStub.getAll.calledOnce).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    const responseArg = res.json.getCall(0).args[0];

    expect(responseArg).to.deep.equal({
      success: true,
      message: "Fetched all products successfully",
      data: fakeProducts,
    });
  });

  it("should call next(err) if getAll fails", async () => {
    const error = new Error("Database error");
    productManagerStub.getAll.rejects(error);

    await getAllProducts(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.equal(error);
  });
});

describe("getProduct Controller", () => {
  let req, res, next, productManagerStub, getProduct;

  beforeEach(() => {
    req = { params: { id: "prod123" } };
    res = {
      json: sinon.stub(),
      status: sinon.stub().returnsThis(),
    };
    next = sinon.spy();

    // Stub ProductManager
    productManagerStub = { getById: sinon.stub() };

    // Use proxyquire to replace ModelFactory before loading the controller
    const productController = proxyquire("../controllers/productController", {
      "../services/ModelFactory": {
        createProductManager: () => productManagerStub,
      },
      "../services/ResponseDecorator": ResponseDecorator,
    });

    getProduct = productController.getProduct;

    // Stub ResponseDecorator.decorate
    sinon.stub(ResponseDecorator, "decorate").callsFake((data) => ({
      success: true,
      data,
    }));
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should fetch a product and return decorated response", async () => {
    const fakeProduct = {
      _id: new mongoose.Types.ObjectId(),
      title: "Cool Sneakers",
    };
    productManagerStub.getById.resolves(fakeProduct);

    await getProduct(req, res, next);

    expect(productManagerStub.getById.calledOnceWith("prod123")).to.be.true;
    expect(res.json.calledOnce).to.be.true;

    const responseArg = res.json.getCall(0).args[0];
    expect(responseArg).to.deep.equal({
      success: true,
      data: fakeProduct,
    });
  });

  it("should return 404 if product not found", async () => {
    productManagerStub.getById.resolves(null);

    await getProduct(req, res, next);

    expect(res.status.calledOnceWith(404)).to.be.true;
    expect(res.json.calledOnce).to.be.true;

    const responseArg = res.json.getCall(0).args[0];
    expect(responseArg).to.deep.equal({
      success: false,
      message: "Product not found",
    });
  });

  it("should call next(err) if getById fails", async () => {
    const error = new Error("Database error");
    productManagerStub.getById.rejects(error);

    await getProduct(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.equal(error);
  });
});

describe("updateProduct Controller", () => {
  let req, res, next;
  let productManagerStub, updateProductController;

  beforeEach(() => {
    // Stub ProductManager
    productManagerStub = {
      updateProduct: sinon.stub(),
      mediaManager: {
        upload: sinon.stub(),
        updateTitle: sinon.stub(),
      },
    };

    // Stub AuthProxy
    const AuthProxyStub = function (user, manager) {
      return {
        updateProduct: productManagerStub.updateProduct,
      };
    };

    // Load controller with proxyquire to inject stubs
    updateProductController = proxyquire("../controllers/productController", {
      "../services/ModelFactory": {
        createProductManager: () => productManagerStub,
      },
      "../services/AuthProxy": AuthProxyStub,
      "../services/ResponseDecorator": ResponseDecorator,
    });

    // Stub ResponseDecorator.decorate
    sinon.stub(ResponseDecorator, "decorate").callsFake((data, msg) => ({
      success: true,
      message: msg,
      data,
    }));

    req = {
      user: { _id: new mongoose.Types.ObjectId() },
      params: { id: "prod123" },
      body: { title: "Updated Product", thumbnailMediaId: "thumb123" },
      files: [
        {
          buffer: Buffer.from("fake image"),
          originalname: "image1.jpg",
          mimetype: "image/jpeg",
          size: 1234,
        },
      ],
    };

    res = {
      json: sinon.stub(),
    };

    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should update a product and return decorated response", async () => {
    const fakeUpdatedProduct = {
      _id: "prod123",
      title: "Updated Product",
      media: [],
      save: sinon.stub().resolves(),
    };

    productManagerStub.updateProduct.resolves(fakeUpdatedProduct);

    await updateProductController.updateProduct(req, res, next);

    expect(productManagerStub.updateProduct.calledOnce).to.be.true;

    const callArgs = productManagerStub.updateProduct.getCall(0).args;
    expect(callArgs[0]).to.equal("prod123");
    expect(callArgs[1].data.title).to.equal("Updated Product");
    expect(callArgs[1].files).to.have.lengthOf(1);
    expect(callArgs[1].thumbnailMediaId).to.equal("thumb123");
    expect(callArgs[1].userId).to.equal(req.user._id);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.getCall(0).args[0]).to.deep.equal({
      success: true,
      message: "Product updated successfully",
      data: fakeUpdatedProduct,
    });
  });

  it("should call next(err) if updateProduct fails", async () => {
    const error = new Error("Update failed");
    productManagerStub.updateProduct.rejects(error);

    await updateProductController.updateProduct(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.equal(error);
  });
});

describe("deleteProduct Controller", () => {
  let req, res, next, proxyStub;

  beforeEach(() => {
    req = {
      user: { _id: new mongoose.Types.ObjectId() },
      params: { id: "prod123" },
    };

    res = {
      json: sinon.stub(),
    };
    next = sinon.spy();

    // Stub productManager
    const productManagerStub = {};
    sinon
      .stub(ModelFactory, "createProductManager")
      .returns(productManagerStub);

    // Stub AuthProxy.deleteProduct
    proxyStub = sinon
      .stub(AuthProxy.prototype, "deleteProduct")
      .resolves({ _id: req.params.id });

    // Stub ResponseDecorator
    sinon.stub(ResponseDecorator, "decorate").callsFake((data, msg) => ({
      success: true,
      message: msg,
      data,
    }));
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should delete a product and return decorated response", async () => {
    await deleteProduct(req, res, next);

    expect(proxyStub.calledOnceWithExactly("prod123")).to.be.true;
    expect(res.json.calledOnce).to.be.true;

    const responseArg = res.json.getCall(0).args[0];
    expect(responseArg).to.deep.equal({
      success: true,
      message: "Product deleted successfully",
    });
  });

  it("should call next(err) if deletion fails", async () => {
    proxyStub.rejects(new Error("Deletion failed"));

    await deleteProduct(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0].message).to.equal("Deletion failed");
  });
});

describe("createProduct Controller", () => {
  let req, res, next, stubCreate, stubDecorate;

  beforeEach(() => {
    req = {
      user: { _id: "user123" },
      body: { name: "Test Product" },
      files: [],
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();

    // Stub prototype method (instance method)
    stubCreate = sinon
      .stub(AuthProxy.prototype, "createProduct")
      .resolves({ _id: "p1", name: "Test Product" });

    // Stub decorator to just return what’s passed
    stubDecorate = sinon
      .stub(ResponseDecorator, "decorate")
      .callsFake((data, msg) => ({
        data,
        message: msg,
      }));
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should create a product and return 201 with decorated response", async () => {
    await createProduct(req, res, next);

    expect(stubCreate.calledOnce).to.be.true;
    expect(stubCreate.firstCall.args[0]).to.include({
      userId: "user123",
    });

    expect(stubDecorate.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
  });
});

describe("addMediaToProduct Controller", () => {
  let req, res, next, productManagerStub, addMediaToProduct;

  beforeEach(() => {
    // Stub productManager methods
    productManagerStub = {
      addMediaToProduct: sinon.stub(),
    };

    // Use proxyquire to override the productManager in the controller
    const controller = require("proxyquire")(
      "../controllers/productController",
      {
        "../services/ModelFactory": {
          createProductManager: () => productManagerStub,
        },
      }
    );

    addMediaToProduct = controller.addMediaToProduct;

    // Stub ResponseDecorator
    sinon.stub(ResponseDecorator, "decorate").callsFake((data, msg) => ({
      success: true,
      message: msg,
      data,
    }));

    // Default request and response objects
    req = {
      params: { id: "prod123" },
      user: { _id: new mongoose.Types.ObjectId() },
      files: [
        { originalname: "image1.jpg", buffer: Buffer.from("fake image") },
      ],
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should add media files and return decorated response", async () => {
    const fakeResult = { _id: "prod123", media: ["image1"] };
    productManagerStub.addMediaToProduct.resolves(fakeResult);

    await addMediaToProduct(req, res, next);

    expect(
      productManagerStub.addMediaToProduct.calledOnceWith(
        "prod123",
        req.files,
        req.user._id
      )
    ).to.be.true;

    expect(res.status.calledOnceWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.getCall(0).args[0]).to.deep.equal({
      success: true,
      message: "1 media file(s) added to product",
      data: fakeResult,
    });
  });

  it("should return 400 if no files are provided", async () => {
    req.files = [];

    await addMediaToProduct(req, res, next);

    expect(res.status.calledOnceWith(400)).to.be.true;
    expect(
      res.json.calledOnceWith({
        success: false,
        message: "No image files provided",
      })
    ).to.be.true;
  });

  it("should return 404 if product not found", async () => {
    const error = new Error("Product not found");
    productManagerStub.addMediaToProduct.rejects(error);

    await addMediaToProduct(req, res, next);

    expect(res.status.calledOnceWith(404)).to.be.true;
    expect(
      res.json.calledOnceWith({
        success: false,
        message: "Product not found",
      })
    ).to.be.true;
  });

  it("should return 400 if max images reached", async () => {
    const error = new Error("Product already has 3 images");
    productManagerStub.addMediaToProduct.rejects(error);

    await addMediaToProduct(req, res, next);

    expect(res.status.calledOnceWith(400)).to.be.true;
    expect(
      res.json.calledOnceWith({
        success: false,
        message: "Product already has 3 images",
      })
    ).to.be.true;
  });

  it("should call next(err) for unexpected errors", async () => {
    const error = new Error("Database error");
    productManagerStub.addMediaToProduct.rejects(error);

    await addMediaToProduct(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0].message).to.equal("Database error");
  });
});

// describe("Get Navigations Function Test", () => {
//   let req, res;

//   beforeEach(() => {
//     req = { user: { _id: new mongoose.Types.ObjectId() } };
//     res = {
//       status: sinon.stub().returnsThis(),
//       json: sinon.spy(),
//     };
//   });

//   afterEach(() => {
//     sinon.restore();
//   });

//   it("should return all Navigations for the User", async () => {
//     const navigations = [
//       { _id: new mongoose.Types.ObjectId(), title: "Nav 1" },
//       { _id: new mongoose.Types.ObjectId(), title: "Nav 2" },
//     ];

//     const findStub = sinon.stub(Navigation, "find").returns({
//       sort: sinon.stub().returnsThis(),
//       populate: sinon.stub().resolves(navigations),
//     });

//     await getNavigations(req, res);

//     expect(findStub.calledOnceWith({ createdBy: req.user._id })).to.be.true;
//     expect(res.status.calledWith(200)).to.be.true;
//     expect(res.json.calledWith({ navigation: navigations })).to.be.true;
//   });

//   it("should return 500 on error", async () => {
//     const error = new Error("DB Error");
//     const findStub = sinon.stub(Navigation, "find").returns({
//       sort: sinon.stub().returnsThis(),
//       populate: sinon.stub().throws(error),
//     });

//     await getNavigations(req, res);

//     expect(res.status.calledWith(500)).to.be.true;
//     expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;
//   });
// });

describe("Create Navigation Function Test", function () {
  this.timeout(5000); // Increase timeout for async operations

  afterEach(() => {
    sinon.restore();
  });

  it("Should Create a new navigation item successfully", async () => {
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

describe("Update Navigation Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: new mongoose.Types.ObjectId() },
      body: {
        title: "Updated Title",
        slug: "updated-slug",
        order: 5,
        parent: null,
      },
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should update a navigation and return the updated document", async () => {
    const fakeNav = {
      _id: req.params.id,
      title: req.body.title,
      slug: req.body.slug,
      order: req.body.order,
      parent: req.body.parent,
    };

    // Stub findByIdAndUpdate to return an object with populate
    const populateStub = sinon.stub().resolves(fakeNav);
    const stub = sinon
      .stub(Navigation, "findByIdAndUpdate")
      .returns({ populate: populateStub });

    await updateNavigation(req, res);

    expect(stub.calledOnce).to.be.true;
    expect(populateStub.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ navigation: fakeNav })).to.be.true;
  });

  it("should return 500 if there is an error", async () => {
    sinon.stub(Navigation, "findByIdAndUpdate").throws(new Error("DB Error"));

    await updateNavigation(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;
  });
});

describe("Delete Navigation Controller Test", () => {
  it("should delete a navigation successfully", async () => {
    const navId = new mongoose.Types.ObjectId().toString();
    const nav = { _id: navId };

    const findByIdAndDeleteStub = sinon
      .stub(Navigation, "findByIdAndDelete")
      .resolves(nav);

    const req = { params: { id: navId } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteNavigation(req, res);

    expect(findByIdAndDeleteStub.calledOnceWith(navId)).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: "Navigation deleted successfully" }))
      .to.be.true;

    findByIdAndDeleteStub.restore();
  });

  it("should return 404 if navigation is not found", async () => {
    const findByIdAndDeleteStub = sinon
      .stub(Navigation, "findByIdAndDelete")
      .resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteNavigation(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: "Navigation not found" })).to.be.true;

    findByIdAndDeleteStub.restore();
  });

  it("should return 500 if an error occurs", async () => {
    const findByIdAndDeleteStub = sinon
      .stub(Navigation, "findByIdAndDelete")
      .throws(new Error("DB Error"));

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteNavigation(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;

    findByIdAndDeleteStub.restore();
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
