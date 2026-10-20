import { describe, expect, it } from "vitest";
import { createInMemoryProductRepository, productRepository, seedProductRepository } from "./product-repository";
import { makeProduct } from "./testing/fixtures";

describe("createInMemoryProductRepository", () => {
  const a = makeProduct({ id: "a" });
  const b = makeProduct({ id: "b" });
  const repository = createInMemoryProductRepository([a, b]);

  it("lists the products it was given, in order", async () => {
    await expect(repository.list()).resolves.toEqual([a, b]);
  });

  it("finds a product by id", async () => {
    await expect(repository.get("b")).resolves.toBe(b);
  });

  it("returns undefined for an unknown id", async () => {
    await expect(repository.get("missing")).resolves.toBeUndefined();
  });
});

describe("seedProductRepository", () => {
  it("exposes every seeded product and resolves each by id", async () => {
    const products = await seedProductRepository.list();

    expect(products.length).toBeGreaterThan(0);
    for (const product of products) {
      await expect(seedProductRepository.get(product.id)).resolves.toBe(product);
    }
  });
});

describe("productRepository", () => {
  it("is backed by the synthetic seed data in the prototype", () => {
    expect(productRepository).toBe(seedProductRepository);
  });
});
