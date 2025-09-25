const BaseRepository = require("./BaseRepository");
const Media = require("../models/Media");

class MediaRepository extends BaseRepository {
  constructor() {
    super(Media);
  }
}

module.exports = MediaRepository;
