import Product from '../../domain/entity/product';
import ProductRepositoryInterface from '../../domain/repository/product-repository-interface';
import ProductModel from '../db/sequelize/model/product.model';

export default class ProductRepository implements ProductRepositoryInterface {
  async create(entity: Product): Promise<void> {
    await ProductModel.create({
      id: entity.id,
      name: entity.name,
      price: entity.price,
    });
  }

  async update(entity: Product): Promise<void> {
    await ProductModel.update(
      {
        name: entity.name,
        price: entity.price,
      },
      { where: { id: entity.id } }
    );
  }

  async findById(id: string): Promise<Product> {
    const productFromModel = await ProductModel.findOne({ where: { id } });

    const product = new Product(
      productFromModel.id,
      productFromModel.name,
      productFromModel.price
    );

    return product;
  }

  async findAll(): Promise<Product[]> {
    const products = await ProductModel.findAll();

    return products.map((productFromModel) => {
      return new Product(
        productFromModel.id,
        productFromModel.name,
        productFromModel.price
      );
    });
  }
}
