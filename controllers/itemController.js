const { Item, Image } = require('../models/models')
const ApiError = require('../error/ApiError')
const uuid = require('uuid')
const path = require('path')
const fs = require('fs')
const { Sequelize } = require('../db')
const { Op } = require('sequelize');

class ItemController {
    async create(req, res, next) {
        try {
            const { code, brand, name, description, price, grip, bend, rigidity, type, count, renew, height } = req.body
            if (req.files && 'img' in req.files) {
                const { img } = req.files
                let fileName = uuid.v4() + ".jpg"
                img.mv(path.resolve(__dirname, '..', 'static', fileName))
                const item = await Item.create({ code, brand, name, description, price, grip, bend, rigidity, type, count, renew, height, img: fileName })
                return res.json(item)
            } else {
                if (count) {
                    const item = await Item.create({ code, brand, name, description, price, grip, bend, rigidity, type, count, renew, height })
                    return res.json(item)
                } else {
                    const item = await Item.create({ code, brand, name, description, price, grip, bend, rigidity, type, count: 1, renew, height })
                    return res.json(item)
                }
            }
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async createAll(req, res, next) {
        try {
            const { code, brand, name, description, price, grips, bends, rigidities, type } = req.body
            if (req.files && 'img' in req.files) {
                const { img } = req.files
                let fileName = uuid.v4() + ".jpg"
                img.mv(path.resolve(__dirname, '..', 'static', fileName))
                for (i of grips) {
                    for (j of bends) {
                        for (k of rigidities) {
                            const item = await Item.create({ code, brand, name, description, price, i, j, k, type, img: fileName })
                        }
                    }
                }
                return res.json(code)
            }
            return res.json(code)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async createXL(req, res, next) {
        try {
            console.log('попытка совершена')
            const { rows } = req.body
            for (let i of rows) {
                console.log(i)
                switch (i['Тип']) {
                    case 'orig':
                        if (i['Артикул'] && i['Фирма'] && i['Название'] && i['Описание'] && i['Цена'] && i['Хват'] && i['Загиб'] && i['Жесткость'] && i['Количество']) {
                            try {
                                const item = await Item.findOne({ where: { code: i['Артикул'].toString(), grip: i['Хват'].toString(), bend: Number(i['Загиб']), rigidity: Number(i['Жесткость']) } })
                                console.log(item)
                                if (!item) {
                                    await Item.create({ code: i['Артикул'], brand: i['Фирма'], name: i['Название'], description: i['Описание'], price: i['Цена'], grip: i['Хват'], bend: i['Загиб'], rigidity: i['Жесткость'], type: 'original', count: i['Количество'] })
                                }
                            } catch (e) {

                            }
                        }
                        break

                    case 'rep':
                        if (i['Артикул'] && i['Фирма'] && i['Название'] && i['Описание'] && i['Цена'] && i['Хват'] && i['Загиб'] && i['Жесткость'] && i['Количество']) {
                            try {
                                const item = await Item.findOne({ where: { code: i['Артикул'].toString(), grip: i['Хват'].toString(), bend: Number(i['Загиб']), rigidity: Number(i['Жесткость']) } })
                                if (!item) {
                                    await Item.create({ code: i['Артикул'], brand: i['Фирма'], name: i['Название'], description: i['Описание'], price: i['Цена'], grip: i['Хват'], bend: i['Загиб'], rigidity: i['Жесткость'], type: 'replica', count: i['Количество'] })
                                }
                            } catch (e) {

                            }
                        }
                        break

                    case 'vos':
                        if (i['Артикул'] && i['Фирма'] && i['Название'] && i['Цена'] && i['Хват'] && i['Загиб'] && i['Жесткость'] && i['Ремонт'] && i['Высота']) {
                            try {
                                const item = await Item.findOne({ where: { code: i['Артикул'].toString(), grip: i['Хват'].toString(), bend: Number(i['Загиб']), rigidity: Number(i['Жесткость']), renew: i['Ремонт'].toString() } })
                                if (!item) {
                                    await Item.create({ code: i['Артикул'], brand: i['Фирма'], name: i['Название'], description: '', price: i['Цена'], grip: i['Хват'], bend: i['Загиб'], rigidity: i['Жесткость'], type: 'restored', count: 1, renew: i['Ремонт'], height: i['Высота'] })
                                }
                            } catch (e) {

                            }
                        }
                        break

                    default:
                        break
                }
            }
            return res.json(rows)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        try {
            const { id, code, brand, name, description, price, grip, bend, rigidity, count, renew, height } = req.body
            const item = await Item.findOne({ where: { id } })
            item.code = code
            item.brand = brand
            item.name = name
            item.description = description
            item.price = price
            item.grip = grip
            item.bend = bend
            item.rigidity = rigidity
            if (count) item.count = count
            else item.count = 1
            if (renew) item.renew = renew
            if (height) item.height = height
            if (req.files && 'img' in req.files) {
                const { img } = req.files
                let fileName = uuid.v4() + ".jpg"
                img.mv(path.resolve(__dirname, '..', 'static', fileName))
                if (item.img) {
                    const filePath = path.resolve(__dirname, '..', 'static', item.img)
                    fs.unlink(filePath, (e) => {
                        if (e) {
                            console.log('Ошибка при удалении файла:', e)
                        } else {
                            console.log('Файл успешно удален')
                        }
                    })
                }
                item.img = fileName
            }
            await item.save()
            return res.json(item)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async buyItems(req, res, next) {
        try {
            const { id, count } = req.body
            const item = await Item.findOne({ where: { id } })
            if (item.count - count > 0) {
                item.count -= count
            } else {
                item.count = 0
            }
            await item.save()
            return res.json(item)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params
            const item = await Item.findOne({ where: { id } })
            return res.json(item)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getSame(req, res, next) {
        try {
            const { code } = req.query
            const items = await Item.findAll({ where: { code } })
            return res.json(items)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getOriginals(req, res, next) {
        try {
            const items = await Item.findAll({ where: { type: 'original' } })
            return res.json(items)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getReplicas(req, res, next) {
        try {
            const items = await Item.findAll({ where: { type: 'replica' } })
            return res.json(items)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getRestored(req, res, next) {
        try {
            const items = await Item.findAll({ where: { type: 'restored' } })
            return res.json(items)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            let { brands, grips, bends, rigidities, type, priceMin, priceMax, limit, page } = req.query
            page = page || 1
            limit = limit || 18
            let offset = page * limit - limit
            if (type !== 'restored') {
//            const items = await Item.findAndCountAll({
//                where: {
//                    brand: { [Op.in]: brands },
//                    grip: { [Op.in]: grips },
//                    bend: { [Op.in]: bends },
//                    rigidity: { [Op.in]: rigidities },
//                    price: {
//                        [Op.and]: [
//                            { [Op.gt]: Number(priceMin) - 1 },
//                            { [Op.lt]: Number(priceMax) + 1 }
//                        ]
//                    },
//                    type,
//                    count: {
//                        [Op.gt]: 0
//                    }
//                },
//                order: [
//                    ['name', 'ASC']
//                ],
//                limit,
//                offset
//            })
                const items = await Item.findAll({
                    attributes: [
                        'code',
                        [Sequelize.fn('count', Sequelize.literal('1')), 'count'],
                        [Sequelize.fn('array_agg', Sequelize.col('id')), 'ids'],
                        [Sequelize.fn('array_agg', Sequelize.col('brand')), 'brands'],
                        [Sequelize.fn('array_agg', Sequelize.col('name')), 'names'],
                        [Sequelize.fn('array_agg', Sequelize.col('description')), 'descriptions'],
                        [Sequelize.fn('array_agg', Sequelize.col('price')), 'prices'],
                        [Sequelize.fn('array_agg', Sequelize.col('grip')), 'grips'],
                        [Sequelize.fn('array_agg', Sequelize.col('bend')), 'bends'],
                        [Sequelize.fn('array_agg', Sequelize.col('rigidity')), 'rigiditys'],
                        [Sequelize.fn('array_agg', Sequelize.col('type')), 'types'],
                        [Sequelize.fn('array_agg', Sequelize.col('count')), 'counts'],
                        [Sequelize.fn('array_agg', Sequelize.col('renew')), 'renews'],
                        [Sequelize.fn('array_agg', Sequelize.col('height')), 'heights'],
                        [Sequelize.fn('array_agg', Sequelize.col('img')), 'imgs'],
                    ],
                    where: {
                        brand: { [Op.in]: brands },
                        grip: { [Op.in]: grips },
                        bend: { [Op.in]: bends },
                        rigidity: { [Op.in]: rigidities },
                        price: {
                            [Op.and]: [
                                { [Op.gt]: Number(priceMin) - 1 },
                                { [Op.lt]: Number(priceMax) + 1 }
                            ]
                        },
                        type,
                        count: {
                            [Op.gt]: 0
                        }
                    },
                    group: ['code', 'name'],
                    order: [
                        ['name', 'ASC']
                    ],
                    limit,
                    offset
                })
                const newItems = {
                    count: items.length,
                    rows: items
                }
                for (let i of items) {
                    console.log(i.code)
                }
                return res.json(newItems)
            } else {
                const items = await Item.findAndCountAll({
                    where: {
                        brand: { [Op.in]: brands },
                        grip: { [Op.in]: grips },
                        bend: { [Op.in]: bends },
                        rigidity: { [Op.in]: rigidities },
                        price: {
                            [Op.and]: [
                                { [Op.gt]: Number(priceMin) - 1 },
                                { [Op.lt]: Number(priceMax) + 1 }
                            ]
                        },
                        type
                    },
                    order: [
                        ['name', 'ASC']
                    ],
                    limit,
                    offset
                })
                return res.json(items)
            }
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getCombs(req, res, next) {
        try {
            const { code } = req.query
            const items = await Item.findAll({ where: { code } })
            let combs = []
            items.forEach((item, i) => {
                let thisGrip = item.grip
                let thisBend = item.bend
                let thisRigidity = item.rigidity
                let thisCount = item.count
                combs.push({ thisGrip, thisBend, thisRigidity, thisCount })
            })
            return res.json(combs)
        } catch (e) {

        }
    }

    async getCount(req, res, next) {
        try {
            const { code, grip, bend, rigidity } = req.query
            const item = await Item.findOne({ where: { code, grip, bend, rigidity } })
            if (item) {
                return res.json(item.count)
            } else {
                return res.json(0)
            }
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getBrands(req, res, next) {
        try {
            const brands = await Item.findAll({
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('brand')), 'brand']
                ]
            })
            return res.json(brands)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getGrips(req, res, next) {
        try {
            const grips = await Item.findAll({
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('grip')), 'grip']
                ]
            })
            return res.json(grips)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getBends(req, res, next) {
        try {
            const bends = await Item.findAll({
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('bend')), 'bend']
                ]
            })
            return res.json(bends)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getRigidities(req, res, next) {
        try {
            const rigidities = await Item.findAll({
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('rigidity')), 'rigidity']
                ]
            })
            return res.json(rigidities)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getMin(req, res, next) {
        try {
            const min = await Item.findOne({
                attributes: [[Sequelize.fn('MIN', Sequelize.col('price')), 'minValue']],
            })
            return res.json(min)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getMax(req, res, next) {
        try {
            const max = await Item.findOne({
                attributes: [[Sequelize.fn('MAX', Sequelize.col('price')), 'minValue']],
            })
            return res.json(max)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async delete(req, res, next) {
        const { id } = req.query
        const item = await Item.findOne({ where: { id } })
        const images = await Image.findAll({ where: { item_code: id.toString() } })
        try {
            if (item.img) {
                const filePath = path.resolve(__dirname, '..', 'static', item.img)
                fs.unlink(filePath, (e) => {
                    if (e) {
                        console.log('Ошибка при удалении файла:', e)
                    } else {
                        console.log('Файл успешно удален')
                    }
                })
            }
            await item.destroy()
            if (images) {
                console.log(images)
                for (let i of images) {
                    const filePath = path.resolve(__dirname, '..', 'static', i.img)
                    fs.unlink(filePath, (e) => {
                        if (e) {
                            console.log('Ошибка при удалении файла:', e)
                        } else {
                            console.log('Файл успешно удален')
                        }
                    })
                    await i.destroy()
                }
            }
            return res.json(item)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async deleteMany(req, res, next) {
        const { idArr } = req.query
        const items = await Item.findAll({
            where: {
                id: { [Op.in]: idArr }
            }
        })
        for (let item of items) {
            try {
                if (item.img) {
                    const filePath = path.resolve(__dirname, '..', 'static', item.img)
                    fs.unlink(filePath, (e) => {
                        if (e) {
                            console.log('Ошибка при удалении файла:', e)
                        } else {
                            console.log('Файл успешно удален')
                        }
                    })
                }
                await item.destroy()
                const images = await Image.findAll({ where: { item_code: item.id.toString() } })
                if (images) {
                    for (let i of images) {
                        const filePath = path.resolve(__dirname, '..', 'static', i.img)
                        fs.unlink(filePath, (e) => {
                            if (e) {
                                console.log('Ошибка при удалении файла:', e)
                            } else {
                                console.log('Файл успешно удален')
                            }
                        })
                        await i.destroy()
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
        return res.json('done')
    }
}

module.exports = new ItemController()