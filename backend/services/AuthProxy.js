// A small proxy wrapper around managers to enforce simple authorization checks.
// (Proxy pattern)

class AuthProxy {
  constructor(user, realManager) {
    this.user = user;
    this.real = realManager;
  }

  async createProduct(args) {
    if (!this.user) throw new Error("Not authenticated");
    // Add createdBy automatically
    return this.real.createProduct({ ...args, userId: this.user._id });
  }

  async updateProduct(id, args) {
    if (!this.user) throw new Error("Not authenticated");
    // You could add role checks or owned-by checks here
    return this.real.updateProduct(id, { ...args, userId: this.user._id });
  }

  async deleteProduct(id) {
    if (!this.user) throw new Error("Not authenticated");
    return this.real.deleteProduct(id);
  }

  // read/search operations might not require auth; forward them
  async search(q, opts) {
    return this.real.search(q, opts);
  }
}

module.exports = AuthProxy;
