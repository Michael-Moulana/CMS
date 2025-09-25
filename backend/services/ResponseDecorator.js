// Wraps a service method call and returns uniform response shape
// (Decorator pattern)

class ResponseDecorator {
  static decorate(data, message = null) {
    return {
      success: true,
      message: message || "Operation successful",
      data,
    };
  }
}

module.exports = ResponseDecorator;
