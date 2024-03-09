use p1_so1;

CREATE TABLE IF NOT EXISTS ram_historico (
    uso INT NOT NULL,
    fecha DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS cpu_historico (
    uso INT NOT NULL,
    fecha DATETIME NOT NULL
);
  
DROP TABLE IF EXISTS ram_historico;
DROP TABLE IF EXISTS cpu_historico;  

SELECT * FROM cpu_historico;
SELECT * FROM  ram_historico;