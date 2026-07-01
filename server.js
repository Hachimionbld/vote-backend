const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./voteDB.db', (err) => {
  if (err) console.error('数据库连接失败', err.message);
  else console.log('数据库连接成功');
});

db.run(`CREATE TABLE IF NOT EXISTS student (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  major TEXT NOT NULL,
  grade TEXT NOT NULL,
  vote INTEGER DEFAULT 0
)`);

const initData = [
  {name:"张明",major:"软件工程",grade:"2023级",vote:14},
  {name:"王芳",major:"数据科学与大数据技术",grade:"2023级",vote:12},
  {name:"李华",major:"计算机科学与技术",grade:"2024级",vote:12},
  {name:"刘伟",major:"人工智能",grade:"2022级",vote:10},
  {name:"杨帆",major:"网络工程",grade:"2023级",vote:9},
  {name:"陈静",major:"软件工程",grade:"2024级",vote:9},
  {name:"赵磊",major:"数字媒体技术",grade:"2024级",vote:6},
  {name:"周婷",major:"计算机科学与技术",grade:"2022级",vote:4},
  {name:"吴强",major:"人工智能",grade:"2024级",vote:3},
  {name:"郑雪",major:"软件工程",grade:"2022级",vote:2}
];

// 接口1：获取全部学生
app.get('/api/getAll', (req, res) => {
  db.all("SELECT * FROM student", (err, rows) => {
    if(err) return res.status(500).json({err:err.message});
    if(rows.length === 0){
      initData.forEach(item=>{
        db.run(`INSERT INTO student(name,major,grade,vote) VALUES(?,?,?,?)`,
        [item.name,item.major,item.grade,item.vote]);
      })
      return res.json(initData);
    }
    res.json(rows);
  })
})

// 接口2：投票
app.post('/api/vote', (req,res)=>{
  const {name,major,grade} = req.body;
  db.get(`SELECT * FROM student WHERE name=? AND major=? AND grade=?`,
  [name,major,grade], (err,row)=>{
    if(err) return res.status(500).json({err:err.message});
    if(row){
      db.run(`UPDATE student SET vote = vote + 1 WHERE id=?`,[row.id],(e)=>{
        if(e) return res.json({success:false,msg:"投票失败"});
        res.json({success:true,msg:"投票成功",newVote:row.vote+1})
      })
    }else{
      db.run(`INSERT INTO student(name,major,grade,vote) VALUES(?,?,?,1)`,
      [name,major,grade],(e)=>{
        if(e) return res.json({success:false,msg:"提名失败"});
        res.json({success:true,msg:"提名并投票成功",newVote:1})
      })
    }
  })
})

// 接口3：重置
app.post('/api/reset', (req,res)=>{
  db.run(`DELETE FROM student`,(err)=>{
    if(err) return res.json({success:false});
    initData.forEach(item=>{
      db.run(`INSERT INTO student(name,major,grade,vote) VALUES(?,?,?,?)`,
      [item.name,item.major,item.grade,item.vote]);
    })
    res.json({success:true,msg:"系统已重置"})
  })
})

app.listen(PORT, ()=>{
  console.log(`服务运行在端口 ${PORT}`);
})
