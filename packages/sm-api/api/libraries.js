const Mongo = require("../common/mongo");
const handleStripKeys = require("../common").handleStripKeys;
const { defaultStripKeys } = require("../common/consts");
const cors = require("../common/cors");

async function fetchLibraries({ framework, list }) {
  const search = {
    ...(framework
      ? {
          framework,
        }
      : null),
    ...(list
      ? {
          packageName: {
            $in: list.trim().split(","),
          },
        }
      : null),
  };
  const cursor = await Mongo.collections.libraries((coll) => coll.find(search));
  return await cursor.toArray();
}

module.exports = cors(async (req, res) => {
  const {
    query: { framework, strip, list, preserveDefaults },
  } = req;

  const keysToStrip = handleStripKeys(
    strip,
    defaultStripKeys.library,
    preserveDefaults
  );

  const libraries = await fetchLibraries({
    framework,
    list,
  });

  libraries.forEach((library) => {
    keysToStrip.forEach((key) => {
      delete library[key];
    });
  });

  res.send(libraries);
});
