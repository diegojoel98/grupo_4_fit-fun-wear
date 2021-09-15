module.exports = function (sequelize, DataTypes) {
    let alias = "Product";
    let cols = {
        id_product: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            type: DataTypes.DATE
        }
    }

    let config = {
        tableName: "products",
        timestamps: false
    }

    const Product = sequelize.define(alias, cols, config);

    // Relaciones
    Product.associate = function (models) {
        // Un producto tiene muchas categorias
        Product.belongsToMany(models.Category, {
            as: 'products_categories',
            through: 'attributes',
            foreignKey: 'id_product',
            otherKey: 'category_id'
        });

        // Un producto tiene muchos colores
        Product.belongsToMany(models.Color, {
            as: 'products_colors',
            through: 'attributes',
            foreignKey: 'id_product',
            otherKey: 'color_id'
        });

        // Un producto tiene muchas tallas
        Product.belongsToMany(models.Size, {
            as: 'products_sizes',
            through: 'attributes',
            foreignKey: 'id_product',
            otherKey: 'size_id'
        });
    }

    return Product;
}