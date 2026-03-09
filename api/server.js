const express = require("express");
const cors = require("cors");
const { faker } = require("@faker-js/faker");

const app = express();
const PORT = process.env.PORT || 8080;
const TOTAL_POSTS = 1000000;

app.use(cors());
app.use(express.json());

function generatePost(id) {
  faker.seed(id * 9973);
  const mediaType = faker.helpers.arrayElement(["image","image","image","video","link","none","none"]);
  const imageCount = mediaType === "image" ? faker.number.int({ min: 1, max: 4 }) : 0;
  return {
    id,
    author: faker.internet.userName(),
    authorAvatar: `https://i.pravatar.cc/150?img=${(id % 70) + 1}`,
    authorFullName: faker.person.fullName(),
    content: faker.helpers.arrayElement([
      faker.lorem.sentence({ min: 5, max: 20 }),
      faker.lorem.paragraph({ min: 1, max: 3 }),
      faker.lorem.sentences({ min: 2, max: 5 }),
    ]),
    media: {
      type: mediaType,
      urls: imageCount > 0
        ? Array.from({ length: imageCount }, (_, i) =>
            `https://picsum.photos/seed/${id * 13 + i}/800/600`)
        : mediaType === "video" ? [`https://picsum.photos/seed/${id}/800/450`]
        : mediaType === "link" ? [`https://example.com/article/${id}`]
        : [],
    },
    likes: faker.number.int({ min: 0, max: 50000 }),
    comments: faker.number.int({ min: 0, max: 5000 }),
    shares: faker.number.int({ min: 0, max: 1000 }),
    timestamp: faker.date.recent({ days: 30 }).toISOString(),
    location: faker.helpers.maybe(() => faker.location.city(), { probability: 0.3 }),
  };
}

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/posts", (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const cursor = req.query.cursor !== undefined ? parseInt(req.query.cursor) : null;
    let startId, direction = "forward";

    if (cursor === null) {
      startId = 500000;
    } else if (cursor < 0) {
      direction = "backward";
      startId = Math.abs(cursor) - 1;
    } else {
      startId = cursor + 1;
    }

    let posts = [];
    if (direction === "forward") {
      for (let i = startId; i < startId + limit && i <= TOTAL_POSTS; i++) {
        posts.push(generatePost(i));
      }
    } else {
      for (let i = startId; i > startId - limit && i >= 1; i--) {
        posts.push(generatePost(i));
      }
      posts.reverse();
    }

    const lastPost = posts[posts.length - 1];
    const firstPost = posts[0];
    const nextCursor = direction === "forward"
      ? (lastPost && lastPost.id < TOTAL_POSTS ? lastPost.id : null)
      : (firstPost && firstPost.id > 1 ? -firstPost.id : null);

    res.json({ data: posts, nextCursor, direction, total: TOTAL_POSTS });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});