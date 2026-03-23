const express = require('express');
const router = express.Router();

// ========== IN-MEMORY DATA (Mock) ==========
let users = [
  { _id: '1', pseudo: 'Tojo', couleur: 'rouge', totalTaches: 0, tachesCompletes: 0, moyenneImportance: 0 },
  { _id: '2', pseudo: 'Mendrika', couleur: 'bleu-clair', totalTaches: 0, tachesCompletes: 0, moyenneImportance: 0 }
];

let tasks = [];
let taskIdCounter = 1;

// ========== USER ENDPOINTS ==========

router.get('/users', (req, res) => {
  res.json(users);
});

router.post('/user', (req, res) => {
  try {
    const { pseudo } = req.body;
    
    if (!['Tojo', 'Mendrika'].includes(pseudo)) {
      return res.status(400).json({ error: 'Pseudo invalide' });
    }

    let user = users.find(u => u.pseudo === pseudo);
    
    if (!user) {
      user = {
        _id: String(users.length + 1),
        pseudo,
        couleur: pseudo === 'Tojo' ? 'rouge' : 'bleu-clair',
        totalTaches: 0,
        tachesCompletes: 0,
        moyenneImportance: 0,
      };
      users.push(user);
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== TASK ENDPOINTS ==========

router.get('/tasks', (req, res) => {
  try {
    const tasksWithUsers = tasks.map(task => ({
      ...task,
      userId: users.find(u => u._id === task.userId),
      completedBy: task.completedBy ? users.find(u => u._id === task.completedBy) : null,
    }));
    res.json(tasksWithUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tasks/user/:userId', (req, res) => {
  try {
    const userTasks = tasks
      .filter(t => t.userId === req.params.userId)
      .map(task => ({
        ...task,
        userId: users.find(u => u._id === task.userId),
        completedBy: task.completedBy ? users.find(u => u._id === task.completedBy) : null,
      }));
    res.json(userTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tasks', (req, res) => {
  try {
    const { titre, description, importance, userId } = req.body;

    const task = {
      _id: String(taskIdCounter++),
      titre,
      description,
      importance,
      userId,
      status: 'pending',
      completedBy: null,
      dateCreation: new Date(),
      dateCompletion: null,
    };

    tasks.push(task);

    // Update user stats
    const user = users.find(u => u._id === userId);
    if (user) {
      user.totalTaches += 1;
    }

    const responseTask = {
      ...task,
      userId: users.find(u => u._id === userId),
    };

    res.status(201).json(responseTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/tasks/:id', (req, res) => {
  try {
    const { completedBy } = req.body;
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    tasks[taskIndex].status = 'completed';
    tasks[taskIndex].completedBy = completedBy;
    tasks[taskIndex].dateCompletion = new Date();

    // Update user stats
    const user = users.find(u => u._id === completedBy);
    if (user) {
      user.tachesCompletes += 1;
    }

    const responseTask = {
      ...tasks[taskIndex],
      userId: users.find(u => u._id === tasks[taskIndex].userId),
      completedBy: users.find(u => u._id === tasks[taskIndex].completedBy),
    };

    res.json(responseTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/tasks/:id', (req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    const task = tasks[taskIndex];
    tasks.splice(taskIndex, 1);

    // Update user stats
    const user = users.find(u => u._id === task.userId);
    if (user) {
      user.totalTaches -= 1;
    }

    res.json({ message: 'Tâche supprimée', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== STATS ENDPOINTS ==========

router.get('/stats/weekly', (req, res) => {
  res.json({ message: 'Stats hebdomadaires' });
});

router.get('/stats/user/:userId', (req, res) => {
  try {
    const user = users.find(u => u._id === req.params.userId);
    const userTasks = tasks.filter(t => t.userId === req.params.userId);

    const completedThisWeek = userTasks.filter(t => {
      if (!t.dateCompletion) return false;
      const daysSince = (new Date() - new Date(t.dateCompletion)) / (1000 * 60 * 60 * 24);
      return t.status === 'completed' && daysSince <= 7;
    }).length;

    res.json({
      user,
      totalTaches: user?.totalTaches || 0,
      tachesCompletes: user?.tachesCompletes || 0,
      completedThisWeek,
      moyenneImportance: user?.moyenneImportance || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats/chart/:userId', (req, res) => {
  try {
    const userTasks = tasks.filter(t => t.userId === req.params.userId);

    const dayData = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      dayData[dayKey] = { completed: 0, importance: 0 };
    }

    userTasks.forEach(task => {
      if (task.status === 'completed' && task.dateCompletion) {
        const dayKey = new Date(task.dateCompletion).toISOString().split('T')[0];
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
