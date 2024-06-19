from flask import Flask, render_template, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

dbPath = './dev.db'

########################################################
########################################################
#                         ITEM                         #
########################################################
########################################################
@app.route('/api/getItems', methods=['GET'])
def getItems():
    try:
        # 获取前端传递的查询参数
        query_param = request.args.get('query_param')

        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute(query_param)
        result = cursor.fetchall()

        # 关闭数据库连接
        connection.close()
        print(query_param)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)})
    

def is_item_existing(name, item_type, gender, length):
    connection = sqlite3.connect(dbPath)
    cursor = connection.cursor()
    cursor.execute('SELECT id FROM Item WHERE name = ? AND type = ? AND gender = ? AND length = ? ', 
                    (name, item_type, gender, length))
    id = cursor.fetchone()
    connection.close()
    return id

@app.route('/api/createItem', methods=['POST'])
def createItem():
    try:
        # 获取前端传递的查询参数
        data = request.json
        
        name = data.get('name')
        item_type = data.get('type')
        gender = data.get('gender')
        length = data.get('length')

        # return jsonify({'error': [name, item_type, gender, length]}), 400

        if not name or not item_type or not gender or not length:
            return jsonify({'error': 'Missing required fields'}), 400
        
        if is_item_existing(name, item_type, gender, length):
            return jsonify({'error': 'Item with the same name already exists'}), 409
        
        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute('''
            INSERT INTO Item (name, type, gender, length)
            VALUES (?, ?, ?, ?);
        ''', (name, item_type, gender, length))

        # 关闭数据库连接
        connection.commit()
        connection.close()

        return jsonify({'message': 'Item created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/deleteItems', methods=['POST'])
def deleteItem():
    try:
        # 获取前端传递的查询参数
        data = request.json
        ids = []
        for i in range(len(data)):
            ids.append(data[i].get('Iid'))


        with sqlite3.connect(dbPath) as connection:
                cursor = connection.cursor()

                cursor.execute('DELETE FROM Record WHERE itemId IN ({})'.format(','.join('?' for _ in ids)), ids)
                cursor.execute('DELETE FROM Item WHERE id IN ({})'.format(','.join('?' for _ in ids)), ids)

        return jsonify({'message': 'Item deleted successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)})
    
@app.route('/api/updateItem', methods=['POST'])
def updateItem():
    try:
        # 获取前端传递的查询参数
        data = request.json
        Iid = data.get('Iid')
        name = data.get('name')
        item_type = data.get('type')
        gender = data.get('gender')
        length = data.get('length')

        
        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute('UPDATE "Item" SET '
                '"name" = ?, '
                '"type" = ?, '
                '"gender" = ?, '
                '"length" = ? '
                'WHERE "id" = ?', 
                (name, item_type, gender, length, Iid))


        # 关闭数据库连接
        connection.commit()
        connection.close()

        return jsonify({'message': 'Item updated successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

########################################################
########################################################
#                        RECORD                        #
########################################################
########################################################
@app.route('/api/getRecords', methods=['GET'])
def getRecords():
    try:
        # 获取前端传递的查询参数
        query_param = request.args.get('query_param')

        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute(query_param)
        result = cursor.fetchall()

        # 关闭数据库连接
        connection.close()

        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)})
    

@app.route('/api/createRecord', methods=['POST'])
def createRecord():
    try:
        # 获取前端传递的查询参数
        data = request.json
        priceIn = data.get('priceIn')
        priceOut = data.get('priceOut')
        numberIn = data.get('numberIn')
        numberOut = data.get('numberOut')
        payment = data.get('payment')
        note = data.get('note')
        timestamp = data.get('timestamp')
        state = data.get('state')


        if data.get('itemId'):
            itemId = data.get('itemId')

            # 连接 SQLite 数据库
            connection = sqlite3.connect(dbPath)
            cursor = connection.cursor()

            # 执行查询
            cursor.execute('''
                    INSERT INTO Record (itemId, customer, state, priceIn, priceOut, numberIn, numberOut, payment, note, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (itemId, '顾客', state, priceIn, priceOut, numberIn, numberOut, payment, note, timestamp))

            # 关闭数据库连接
            connection.commit()
            connection.close()
        else:
            name = data.get('name')
            item_type = data.get('type')
            gender = data.get('gender')
            length = data.get('length')

            # 使用 context manager 连接 SQLite 数据库
            with sqlite3.connect(dbPath) as connection:
                cursor = connection.cursor()

                    # 执行查询
                itemId = is_item_existing(name, item_type, gender, length)
                if not itemId:
                    cursor.execute('''
                    INSERT INTO Item (name, type, gender, length)
                    VALUES (?, ?, ?, ?)
                ''', (name, item_type, gender, length))
                itemId = is_item_existing(name, item_type, gender, length)

                cursor.execute('''
                    INSERT INTO Record (itemId, customer, priceIn, priceOut, numberIn, numberOut, payment, note, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (itemId, '顾客', priceIn, priceOut, numberIn, numberOut, payment, note, timestamp))

        return jsonify({'message': 'Item created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/deleteRecords', methods=['POST'])
def deleteRecords():
    try:
        # 获取前端传递的查询参数
        data = request.json
        ids = []
        for i in range(len(data)):
            ids.append(data[i].get('Rid'))

        
        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute('DELETE FROM Record WHERE id IN ({})'.format(','.join('?' for _ in ids)), ids)

        # 关闭数据库连接
        connection.commit()
        connection.close()

        return jsonify({'message': 'Item deleted successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/updateRecord', methods=['POST'])
def updateRecord():
    try:
        # 获取前端传递的查询参数
        data = request.json
        Rid = data.get('Rid')
        priceIn = data.get('priceIn')
        priceOut = data.get('priceOut')
        numberIn = data.get('numberIn')
        numberOut = data.get('numberOut')
        payment = data.get('payment')
        note = data.get('note')
        timestamp = data.get('timestamp')
        state = data.get('state')
        
        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute('UPDATE "Record" SET '
                '"priceIn" = ?, '
                '"priceOut" = ?, '
                '"numberIn" = ?, '
                '"numberOut" = ?, '
                '"payment" = ?, '
                '"note" = ?, '
                '"timestamp" = ?, '
                '"state" = ? '
                'WHERE "id" = ?', 
                (priceIn, priceOut, numberIn, numberOut, payment, note, timestamp, state, Rid))


        # 关闭数据库连接
        connection.commit()
        connection.close()

        return jsonify({'message': 'Record updated successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

########################################################
########################################################
#                       SERVICE                        #
########################################################
########################################################
@app.route('/api/getServices', methods=['GET'])
def getServices():
    try:
        # 获取前端传递的查询参数
        query_param = request.args.get('query_param')

        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute(query_param)
        result = cursor.fetchall()

        # 关闭数据库连接
        connection.close()

        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)})
    

@app.route('/api/createService', methods=['POST'])
def createService():
    try:
        # 获取前端传递的查询参数
        data = request.json
        type = data.get('type')
        price = data.get('price')
        number = data.get('number')
        note = data.get('note')
        timestamp = data.get('timestamp')
        IOO = data.get('IOO')

        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute('''
                INSERT INTO Service (type, price, number, note, timestamp, IOO)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (type, price, number, note, timestamp, IOO))

        # 关闭数据库连接
        connection.commit()
        connection.close()
        
        return jsonify({'message': 'Item created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/deleteServices', methods=['POST'])
def deleteServices():
    try:
        # 获取前端传递的查询参数
        data = request.json
        ids = []
        for i in range(len(data)):
            ids.append(data[i].get('Sid'))
        print(ids)

        
        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute('DELETE FROM Service WHERE id IN ({})'.format(','.join('?' for _ in ids)), ids)

        # 关闭数据库连接
        connection.commit()
        connection.close()

        return jsonify({'message': 'Service deleted successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/updateService', methods=['POST'])
def updateService():
    try:
        # 获取前端传递的查询参数
        data = request.json
        type = data.get('type')
        price = data.get('price')
        number = data.get('number')
        note = data.get('note')
        timestamp = data.get('timestamp')
        Sid = data.get('Sid')

        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute('UPDATE "Service" SET '
                '"type" = ?, '
                '"price" = ?, '
                '"number" = ?, '
                '"note" = ?, '
                '"timestamp" = ? '
                'WHERE "id" = ?', 
                (type, price, number, note, timestamp, Sid))


        # 关闭数据库连接
        connection.commit()
        connection.close()
        
        return jsonify({'message': 'Item created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

########################################################
########################################################
#                      DASHBOARD                       #
########################################################
########################################################
@app.route('/api/getSummary', methods=['GET'])
def getSummary():
    try:

        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute('''
                SELECT
                    priceIn,
                    priceOut,
                    numberIn,
                    numberOut
                FROM
                    Record;
            ''')
        result = cursor.fetchall()
        # 收入，支出，库存
        totalOut, totalIn, totalStock = 0, 0, 0
        for r in result:
            totalOut += r[1] * r[3]
            totalIn += r[0] * r[2]
            totalStock += r[2] - r[3]
        # return jsonify(result)
        cursor.execute('''
            SELECT
                price,
                number,
                IOO
            FROM
                Service;
            ''')
        result = cursor.fetchall()
        for r in result:
            if r[2] == '收入':
                totalOut += r[0] * r[1]
            else:
                totalIn += r[0] * r[1]

        # 关闭数据库连接
        connection.close()
        
        return jsonify([totalIn, totalOut, totalStock])
    except Exception as e:
        return jsonify({'error': str(e)})
    

@app.route('/api/getMonthData', methods=['POST'])
def getMonthData():
    try:
    
        # 获取前端传递的查询参数
        data = request.json
        month = data.get('month')

        
        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute('''
            SELECT
                priceIn,
                priceOut,
                numberIn,
                numberOut
            FROM
                Record
            WHERE
                timestamp LIKE ?;
            ''', (f'{month}%',))
        result = cursor.fetchall()
        print(result)
        # 收入，支出，库存
        totalOut, totalIn, stockIn, stockOut = 0, 0, 0, 0
        for r in result:
            totalOut += r[1] * r[3]
            totalIn += r[0] * r[2]
            stockIn += r[2]
            stockOut += r[3]
        # return jsonify(result)
        cursor.execute('''
            SELECT
                price,
                number,
                IOO
            FROM
                Service
            WHERE
                timestamp LIKE ?
            ''', (f'{month}%',))
        result = cursor.fetchall()
        for r in result:
            if r[2] == '收入':
                totalOut += r[0] * r[1]
            else:
                totalIn += r[0] * r[1]

        # 关闭数据库连接
        connection.close()
        
        # return jsonify({'result': result})
        return jsonify([totalIn, totalOut, stockIn, stockOut])
    except Exception as e:
        return jsonify({'error': str(e)})
    

@app.route('/api/getSaleByMonth', methods=['GET'])
def getSaleByMonth():
    try:

        # 连接 SQLite 数据库
        connection = sqlite3.connect(dbPath)
        cursor = connection.cursor()

        # 执行查询
        cursor.execute('''
            SELECT
                strftime('%Y-%m', timestamp) AS month,
                COALESCE(SUM(price * number), 0) AS total_sale
            FROM
                (
                    SELECT price, number, timestamp FROM Service WHERE IOO = '收入'
                    UNION ALL
                    SELECT priceOut as price, numberOut as number, timestamp FROM Record
                )
            GROUP BY 
                month;
            ''')
        result = cursor.fetchall()
        res = []
        # 收入，支出，库存
        for r in result:
            d = {}
            d['年月'] = r[0]
            d['销售额'] = r[1]
            res.append(d)

        

        # 关闭数据库连接
        connection.close()
        
        return jsonify(res)
    except Exception as e:
        return jsonify({'error': str(e)})
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug = True)
    # debug = True, use_reloader=False