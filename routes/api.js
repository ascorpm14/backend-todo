 const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const Stats = require('../models/Stats');

// ============= USER ENDPOINTS =============

// GET tous les users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST créer/obtenir un user
router.post('/user', async (req, res) => {
  try {
    const { pseudo } = req.body;
    
    if (!['Tojo', 'Mendrika'].includes(pseudo)) {
      return res.status(400).json({ error: 'Pseudo invalide' });
    }

    let user = await User.findOne({ pseudo });
    
    if (!user) {
      user = new User({
        pseudo,
        couleur: pseudo === 'Tojo' ? 'rouge' : 'bleu-clair',
      });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= TASK ENDPOINTS =============

// GET toutes les tâches
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('userId', 'pseudo couleur')
      .populate('completedBy', 'pseudo couleur')
      .sort({ dateCreation: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET tâches d'un user
router.get('/tasks/user/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId })
      .populate('userId', 'pseudo couleur')
      .populate('completedBy', 'pseudo couleur')
      .sort({ dateCreation: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST créer une tâche
router.post('/tasks', async (req, res) => {
  try {
    const { titre, description, importance, userId } = req.body;

    const task = new Task({
      titre,
      description,
      importance,
      userId,
    });

    await task.save();
    await task.populate('userId', 'pseudo couleur');

    // Mettre à jour user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { totalTaches: 1 },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT marquer une tâche comme complétée
router.put('/tasks/:id', async (req, res) => {
  try {
    const { completedBy } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        completedBy,
        dateCompletion: new Date(),
      },
      { new: true }
    )
      .populate('userId', 'pseudo couleur')
      .populate('completedBy', 'pseudo couleur');

    // Mettre à jour user stats
    await User.findByIdAndUpdate(completedBy, {
      $inc: { tachesCompletes: 1 },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE supprimer une tâche
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (task) {
      await User.findByIdAndUpdate(task.userId, {
        $inc: { totalTaches: -1 },
      });
    }

    res.json({ message: 'Tâche supprimée', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= STATS ENDPOINTS =============

// GET statistiques hebdom
router.get('/stats/weekly', async (req, res) => {
  try {
    const stats = await Stats.find()
      .populate('userId', 'pseudo couleur')
      .sort({ semaine: -1 });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET stats d'un user
router.get('/stats/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const recentTasks = await Task.find({ userId: req.params.userId })
      .populate('userId', 'pseudo couleur');

    const completedThisWeek = recentTasks.filter(t => {
      const daysSince = (new Date() - t.dateCompletion) / (1000 * 60 * 60 * 24);
      return t.status === 'completed' && daysSince <= 7;
    }).length;

    res.json({
      user,
      totalTaches: user.totalTaches,
      tachesCompletes: user.tachesCompletes,
      completedThisWeek,
      moyenneImportance: user.moyenneImportance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET graphique données (7 derniers jours)
router.get('/stats/chart/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId });

    const dayData = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      dayData[dayKey] = { completed: 0, importance: 0 };
    }

    tasks.forEach(task => {
      if (task.status === 'completed' && task.dateCompletion) {
        const dayKey = task.dateCompletion.toISOString().split('T')[0];
        if (dayData[dayKey]) {
          dayData[dayKey].completed += 1;
          dayData[dayKey].importance += task.importance;
        }
      }
    });

    const labels = Object.keys(dayData);
    const completed = labels.map(day => dayData[day].completed);
    const importance = labels.map(day => 
      dayData[day].completed > 0 ? dayData[day].importance / dayData[day].completed : 0
    );

    res.json({ labels, completed, importance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
