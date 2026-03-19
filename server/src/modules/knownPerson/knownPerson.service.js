import KnownPerson from "./knownPerson.model.js";

function normalizeName(name) {
  return typeof name === "string" ? name.trim() : "";
}

function normalizeEmbeddings(embeddings) {
  if (!Array.isArray(embeddings)) {
    return [];
  }

  return embeddings
    .filter((vector) => Array.isArray(vector) && vector.length > 0)
    .map((vector) => vector.map((value) => Number(value) || 0));
}

function toPayload(item) {
  return {
    id: String(item._id),
    name: item.name,
    embeddings: Array.isArray(item.embeddings) ? item.embeddings : [],
    updatedAt: item.updatedAt,
  };
}

export async function listKnownPersons(userId) {
  const items = await KnownPerson.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();
  return items.map(toPayload);
}

export async function saveKnownPerson({ userId, name, embeddings }) {
  const normalizedName = normalizeName(name);
  if (!normalizedName) {
    throw new Error("Known person name is required.");
  }

  const normalizedEmbeddings = normalizeEmbeddings(embeddings);
  if (normalizedEmbeddings.length < 1) {
    throw new Error("At least 1 face embedding is required.");
  }

  const saved = await KnownPerson.findOneAndUpdate(
    { userId, name: normalizedName },
    {
      $set: {
        embeddings: normalizedEmbeddings,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        userId,
        name: normalizedName,
        createdAt: new Date(),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();

  return toPayload(saved);
}

export async function deleteKnownPersonById(userId, personId) {
  const normalizedId = typeof personId === "string" ? personId.trim() : "";
  if (!normalizedId) {
    throw new Error("Known person id is required.");
  }

  const deleted = await KnownPerson.findOneAndDelete({
    _id: normalizedId,
    userId,
  }).lean();

  if (!deleted) {
    throw new Error("Known person not found.");
  }

  return {
    id: String(deleted._id),
    name: deleted.name,
  };
}

export async function clearKnownPersons(userId) {
  const result = await KnownPerson.deleteMany({ userId });
  return { deletedCount: result.deletedCount || 0 };
}
