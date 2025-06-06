import BookService from "../services/bookService";
import { Request, Response } from "express";
import { Router } from "express";
import { Book } from "../types/book";

const bookService = new BookService();
const router = Router();

class BookController {
  public async findAllBooksController(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const books = await bookService.findAllBooks();
      return res.status(200).json(books);
    } catch (error) {
      return res.status(500).json({
        error: `Erro ao buscar livros: ${
          error instanceof Error ? error.message : error
        }`,
      });
    }
  }

  public async createBookController(req: Request, res: Response): Promise<Response> {
    try {
      const { title, description, publication_date, authorId, categoryId } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const coverImage = files?.coverImage?.[0]?.buffer;
      const coverImageType = files?.coverImage?.[0]?.mimetype;

      // Garantir que a data está no formato correto
      const parsedDate = new Date(publication_date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          error: "Data de publicação inválida. Use o formato YYYY-MM-DD"
        });
      }

      const book = await bookService.createBook(
        title,
        description,
        parsedDate,
        Number(authorId),
        Number(categoryId),
        coverImage,
        coverImageType
      );

      return res.status(201).json(book);
    } catch (error) {
      return res.status(500).json({
        error: `Erro ao criar o livro: ${error instanceof Error ? error.message : error}`
      });
    }
  }

  public async deleteBookController(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<Response<any, Record<string, any>>> {
    try {
      const bookDelete = await bookService.deleteBook(Number(req.params.id));
      return res.status(204).json(bookDelete);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "erro ao tentar deletar livro: " + error });
    }
  }

  public async findBookByIdController(req: Request, res: Response) {
    try {
      const book = await bookService.findBookById(Number(req.params.id));
      const response = book.toJSON();

      if (book.coverImage) {
        response.coverImage = book.coverImage.toString("base64");
      }

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar livro: " + error });
    }
  }

  public async updateBookController(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { title, description, publication_date, authorId, categoryId } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Log para debug
      console.log("Dados recebidos no controller:", {
        id,
        title,
        description,
        publication_date,
        authorId,
        categoryId,
        hasFiles: !!files
      });

      const existingBook = await bookService.findBookById(Number(id));
      if (!existingBook) {
        return res.status(404).json({ error: "Livro não encontrado" });
      }

      const updateData = {
        title,
        description,
        publication_date: publication_date ? new Date(publication_date) : existingBook.publication_date,
        authorId: authorId || existingBook.authorId,
        categoryId: categoryId || existingBook.categoryId,
        coverImage: files?.coverImage?.[0]?.buffer || existingBook.coverImage,
        coverImageType: files?.coverImage?.[0]?.mimetype ?? existingBook.coverImageType ?? undefined
      };

      const updatedBook = await bookService.updateBook(
        Number(id),
        updateData.title,
        updateData.description,
        updateData.publication_date,
        updateData.authorId,
        updateData.categoryId,
        updateData.coverImage,
        updateData.coverImageType
      );

      // Log do livro atualizado
      console.log("Livro atualizado:", updatedBook);

      return res.status(200).json(updatedBook);
    } catch (error) {
      console.error("Erro ao atualizar livro:", error);
      return res.status(500).json({
        error: `Erro ao atualizar livro: ${error instanceof Error ? error.message : error}`
      });
    }
  }
}

export default BookController;
