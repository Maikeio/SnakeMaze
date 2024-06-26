import mysql, { MysqlError } from 'mysql';

export default function querry(db: mysql.Connection, querry: string ): Promise<mysql.MysqlError | any> {
    return new Promise((resolve, reject)=>{
        db.query(querry, (err, res)=>{
            if(err){
                reject(err);
            } else{
                resolve(res);
            }
        });
    })
}