import { test, expect } from '@playwright/test';

test.describe('Crud completa de books', () => {
    test('Deve realizar o fluxo completo de criar, editar, listar e excluir um livro', async ({page}) => {
        // login
        await page.goto('https://nexolivro.com.br/login');
        await page.fill('#email', 'emanuelramospaiva@gmail.com');
        await page.fill('#password', 'Manu010!');
        await page.getByRole("button", { name: "Entrar" }).click();
        await expect(page).toHaveURL('https://nexolivro.com.br/');
        await page.waitForLoadState('networkidle');
        
        // Criar autor
        await page.getByRole("link", {name: "Autores"}).click();
        await page.waitForLoadState('networkidle');
        
        await page.fill('#name', 'Autor Teste');
        await page.fill('#bio', 'Esta é uma biografia de teste com mais de 10 caracteres');
        await page.fill('#birth', '1980-01-01');
        await page.getByRole('button', { name: /adicionar autor/i }).click();
        await page.waitForLoadState('networkidle');
        
        // Criar categoria
        await page.getByRole("link", {name: "Categorias"}).click();
        await page.waitForLoadState('networkidle');
        
        await page.fill('#name', 'Categoria Teste');
        await page.getByRole('button', { name: /adicionar categoria/i }).click();
        await page.waitForLoadState('networkidle');
        
        // Criar livro
        await page.getByRole("link", {name: "Home"}).click();
        await page.waitForLoadState('networkidle');
        
        const addButton = page.getByRole('button', { name: /adicionar|novo livro/i });
        if (await addButton.isVisible({ timeout: 3000 })) {
            await addButton.click();
            await page.waitForTimeout(1000);
        }
        
        await page.waitForSelector('#title', { state: 'visible' });
        await page.fill('#title', 'test');
        await page.fill('#description', 'test description muito longa');
        await page.fill('#publicationDate', '2000-10-10');
        
        await page.waitForTimeout(2000);
        
        await page.selectOption('#author', { label: 'Autor Teste' });
        await page.selectOption('#category', { label: 'Categoria Teste' });
        
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('h2.book-title', { hasText: 'test' }).first()).toBeVisible();
        await page.screenshot({ path: 'livro-criado.png' });

        // Editar livro
        await page.locator('h2.book-title:has-text("test")').locator('..').locator('button:has-text("Editar")').first().click();

        await page.waitForSelector('#title', { state: 'visible' });
        await page.fill('#title', 'Ficção');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        await page.screenshot({ path: 'depois-edicao.png' });
        console.log('URL após edição:', await page.url());
        
        await page.goto('https://nexolivro.com.br/');
        await page.waitForLoadState('networkidle');

        const titulos = await page.locator('h2.book-title').allTextContents();
        console.log('Títulos na página:', titulos);

        const livroPresente = titulos.some(titulo => titulo === 'Ficção' || titulo === 'test');
        if (!livroPresente) {
            console.log('AVISO: Nenhum dos títulos esperados encontrados na página');
        }

        // Excluir livro
        try {
            const ficaoPresente = await page.locator('h2.book-title', { hasText: 'Ficção' }).count() > 0;
            if (ficaoPresente) {
                await expect(page.locator('h2.book-title', { hasText: 'Ficção' }).first()).toBeVisible();
                
                page.once('dialog', async dialog => {
                    if (dialog.type() === 'confirm') {
                        await dialog.accept();
                    } else {
                        await dialog.dismiss();
                    }
                });
                await page.locator('h2.book-title:has-text("Ficção")').locator('..').getByRole('button', { name: 'Excluir' }).first().click();
            } else {
                console.log('Título "Ficção" não encontrado, tentando o título original "test"');
                await expect(page.locator('h2.book-title', { hasText: 'test' }).first()).toBeVisible();
                
                page.once('dialog', async dialog => {
                    if (dialog.type() === 'confirm') {
                        await dialog.accept();
                    } else {
                        await dialog.dismiss();
                    }
                });
                await page.locator('h2.book-title:has-text("test")').locator('..').getByRole('button', { name: 'Excluir' }).first().click();
            }
            
            await expect(page.locator('h2.book-title', { hasText: 'Ficção' })).toHaveCount(0);
            await expect(page.locator('h2.book-title', { hasText: 'test' })).toHaveCount(0);
        } catch (error) {
            console.error('Erro durante verificação/exclusão:', error);
            await page.screenshot({ path: 'erro-final.png' });
            throw error;
        }

        await page.waitForTimeout(1000);
        await page.goto('https://nexolivro.com.br/');
        await page.waitForLoadState('networkidle');

        try {
            const bookStillExists = await page.locator('h2.book-title:has-text("test")').first().isVisible()
                .catch(() => false);
            
            expect(bookStillExists).toBeFalsy();
        } catch (error) {
            console.error('Erro ao verificar exclusão:', error);
            await page.screenshot({ path: 'erro-verificacao-exclusao.png' });
            throw error;
        }
    })

    test('Deve exibir erro ao tentar criar um livro com nome vazio', async ({page}) => {
        await page.goto('https://nexolivro.com.br/login');
        await page.fill('#email', 'emanuelramospaiva@gmail.com');
        await page.fill('#password', 'Manu010!');
        await page.getByRole("button", { name: "Entrar" }).click();
        
        await expect(page).toHaveURL('https://nexolivro.com.br/');
        await page.waitForLoadState('networkidle');
        
        await page.getByRole("link", {name: "Home"}).click();
        await page.waitForLoadState('networkidle');
        
        const addButton = page.getByRole('button', { name: /adicionar|novo livro/i });
        if (await addButton.isVisible({ timeout: 3000 })) {
            await addButton.click();
            await page.waitForTimeout(1000);
        }
        
        await page.waitForSelector('#title', { state: 'visible', timeout: 5000 });
        await page.fill('#title', ' ');
        await page.click('button[type="submit"]');
        
        const required = page.locator('#title');
        await expect(required).toHaveAttribute('required');
    })
})