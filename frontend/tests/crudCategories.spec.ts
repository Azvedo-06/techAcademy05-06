import { test, expect } from '@playwright/test';

test.describe('Crud completa de categorias', () => {
    test('Deve realizar o fluxo completo de criar, editar, listar e excluir uma categoria de livro', async ({page}) => {
        // login
        page.goto('https://nexolivro.com.br/login');

        await page.fill('#email', 'emanuelramospaiva@gmail.com');
        await page.fill('#password', 'Manu010!');

        await page.getByRole("button", { name: "Entrar" }).click()
        await expect(page).toHaveURL('https://nexolivro.com.br/');
        await page.getByRole("link", {name: "Categorias"} )

        // Criar uma categoria
        await page.goto('https://nexolivro.com.br/categories');
        
        await page.fill('#name', 'Terror');
        await page.click('button[type="submit"]');
        
        // listar categorias
        await page.goto('https://nexolivro.com.br/categories');
        await page.locator('h2.book-title', { hasText: 'Terror' });

        // Editar produto
        await page.locator('tr', { hasText: 'Terror' }).getByRole('button', { name: 'Editar' })  
        await page.fill('#name', 'Ficção');
        await page.click('button[type="submit"]');

        // Excluir categorias
        await expect(page.locator('h2.book-title:has-text("Ficção")')).toHaveText('Ficção');
       
        page.once('dialog', async dialog => {
            if (dialog.type() === 'confirm') {
            await dialog.accept(); // clicar em "OK"
        } else {
            await dialog.dismiss(); // se for outro tipo, cancelar
        }
        });

        await page.locator('h2.book-title:has-text("Ficção")').locator('..').getByRole('button', { name: 'Excluir' }).click()
        await expect(page.locator('h2.book-title:has-text("Ficção")')).toHaveCount(0);
    })

    test('Deve exibir erro ao tentar criar uma categoria com nome vazio', async ({page}) => {
        await page.goto('https://nexolivro.com.br/login');
        await page.fill('#email', 'emanuelramospaiva@gmail.com');
        await page.fill('#password', 'Manu010!');
        await page.getByRole("button", { name: "Entrar" }).click();
        
        await expect(page).toHaveURL('https://nexolivro.com.br/');
        await page.waitForLoadState('networkidle');
        
        await page.getByRole("link", {name: "Categorias"}).click();
        await page.waitForLoadState('networkidle');
        
        await expect(page.locator('h1.page-title')).toContainText('Categorias');
        
        await page.waitForSelector('#name', { state: 'visible', timeout: 5000 });
        
        await page.fill('#name', ' ');
        
        // Clicar no botão de adicionar categoria
        await page.getByRole('button', { name: 'Adicionar Categoria' }).click();
        
        // Verificar o atributo required
        const nameField = page.locator('#name');
        await expect(nameField).toHaveAttribute('required');
    })
})