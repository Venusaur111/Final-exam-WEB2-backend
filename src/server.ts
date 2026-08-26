import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});
app.use("/api/v1", userRoutes);
app.use("/api/v1", examRoutes);
app.use("/api/v1", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
