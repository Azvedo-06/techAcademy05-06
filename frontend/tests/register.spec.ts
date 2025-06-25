import { test, expect } from '@playwright/test';

// Função para gerar CPF válido aleatório
function gerarCpfAleatorio() {
  // Gera 9 números aleatórios
  const num1 = Math.floor(Math.random() * 999);
  const num2 = Math.floor(Math.random() * 999);
  const num3 = Math.floor(Math.random() * 999);
  
  let cpf = `${String(num1).padStart(3, '0')}${String(num2).padStart(3, '0')}${String(num3).padStart(3, '0')}`;
  
  let soma = 0;
  let peso = 10;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * peso;
    peso--;
  }
  let resto = soma % 11;
  let dv1 = resto < 2 ? 0 : 11 - resto;
  
  soma = 0;
  peso = 11;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * peso;
    peso--;
  }
  soma += dv1 * 2;
  resto = soma % 11;
  let dv2 = resto < 2 ? 0 : 11 - resto;
  
  // Formata o CPF com pontos e traço
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${dv1}${dv2}`;
}

test.describe('Pagina de Registrar-se', () => {
    test('Deve criar um registro de usuario com sucesso', async ({page}) => {
        await page.goto('https://nexolivro.com.br/register');

        // Gere um email e CPF aleatórios para cada execução
        const randomNum = Math.floor(Math.random() * 10000);
        await page.fill('#name', `Teste User ${randomNum}`);
        await page.fill('#email', `teste${randomNum}@gmail.com`);
        await page.fill('#password', '123456');
        await page.fill('#cpf', gerarCpfAleatorio()); // CPF aleatório válido

        await page.click('button[type="submit"]');
        
        // Aumente o timeout para dar tempo da API processar
        await expect(page.locator('p.success-message')).toHaveText(
          /Cadastro realizado com sucesso! Redirecionando para login.../,
          { timeout: 10000 }
        );
    })

    // cpf já em uso
    test('Deve falhar ao criar usuario com um cpf que já está em uso', async ({page}) => {
        await page.goto('https://nexolivro.com.br/register');

        await page.fill('#name', 'andre');
        await page.fill('#email', 'andre@gmail.com');
        await page.fill('#password', '517702');
        await page.fill('#cpf', '114.364.369-07'); // cpf já em uso

        await page.click('button[type="submit"]');

        await expect(page.locator('p.error-message')).toHaveText(/CPF já está em uso./);
    })
})