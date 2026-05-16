-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NULL,
    `login` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(100) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_login_key`(`login`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NULL,

    UNIQUE INDEX `categorias_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receitas` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuarios` INTEGER UNSIGNED NOT NULL,
    `id_categorias` INTEGER UNSIGNED NULL,
    `nome` VARCHAR(45) NULL,
    `tempo_preparo_minutos` INTEGER UNSIGNED NULL,
    `porcoes` INTEGER UNSIGNED NULL,
    `modo_preparo` TEXT NOT NULL,
    `ingredientes` TEXT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `receitas` ADD CONSTRAINT `receitas_id_usuarios_fkey` FOREIGN KEY (`id_usuarios`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receitas` ADD CONSTRAINT `receitas_id_categorias_fkey` FOREIGN KEY (`id_categorias`) REFERENCES `categorias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
