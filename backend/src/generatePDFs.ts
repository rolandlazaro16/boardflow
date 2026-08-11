import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const publicDir = path.join(__dirname, '../public');

const books = [
  {
    fileName: 'sample1.pdf',
    title: 'ANNA KARENINA',
    author: 'by Leo Tolstoy',
    content: `Chapter 1

All happy families are alike; each unhappy family is unhappy in its own way.

Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl, who had been a governess in their family, and she had declared to her husband that she could not go on living in the same house with him. This position had now lasted for three days, and not only the husband and wife themselves, but all the members of their family and household, were painfully conscious of it. Every person in the house felt that there was no sense in their living together, and that the stray people who met by chance at any inn had more in common with one another than they, the members of the family and household of the Oblonskys. The wife did not leave her own room, the husband had not been at home for three days. The children ran wild all over the house; the English governess quarreled with the housekeeper, and wrote to a friend asking her to look out for a new situation for her; the man-cook had walked off the day before just at dinner time; the kitchen-maid, and the coachman had given warning.`
  },
  {
    fileName: 'sample2.pdf',
    title: 'THE WONDERFUL WIZARD OF OZ',
    author: 'by L. Frank Baum',
    content: `Chapter 1: The Cyclone

Dorothy lived in the midst of the great Kansas prairies, with Uncle Henry, who was a farmer, and Aunt Em, who was the farmer's wife. Their house was small, for the lumber to build it had to be carried by wagon many miles. There were four walls, a floor and a roof, which made one room; and this room contained a rusty looking cookstove, a cupboard for the dishes, a table, three or four chairs, and the beds. Uncle Henry and Aunt Em had a big bed in one corner, and Dorothy a little bed in another corner. There was no garret at all, and no cellar--except a small hole dug in the ground, called a cyclone cellar, where the family could go in case one of those great whirlwinds arose, mighty enough to crush any building in its path. It was reached by a trap door in the middle of the floor, from which a ladder led down into the small, dark hole.

When Dorothy stood in the doorway and looked around, she could see nothing but the great gray prairie on every side. Not a tree nor a house broke the broad sweep of flat country that reached to the edge of the sky in all directions. The sun had baked the plowed land into a gray mass, with little cracks running through it. Even the grass was not green, for the sun had burned the tops of the long blades until they were the same gray color to be seen everywhere. Once the house had been painted, but the sun blistered the paint and the rains washed it away, and now the house was as dull and gray as everything else.`
  },
  {
    fileName: 'sample3.pdf',
    title: 'PETER AND WENDY',
    author: 'by J. M. Barrie',
    content: `Chapter 1: Peter Breaks Through

All children, except one, grow up. They soon know that they will grow up, and the way Wendy knew was this. One day when she was two years old she was playing in a garden, and she plucked another flower and ran with it to her mother. I suppose she must have looked rather delightful, for Mrs. Darling put her hand to her heart and cried, "Oh, why can't you remain like this forever!" This was all that passed between them on the subject, but thenceforth Wendy knew that she must grow up. You always know after you are two. Two is the beginning of the end.

Of course they lived at 14 [their house number on their street], and until Wendy came her mother was the chief one. She was a lovely lady, with a romantic mind and such a sweet mocking mouth. Her romantic mind was like the tiny boxes from the puzzling East that contain other boxes, and those contain others, and so on; and her sweet mocking mouth had one kiss on it that Wendy could never get, though there it was, in the right-hand corner.

The way Mr. Darling won her was this: the many gentlemen who had been boys when she was a girl discovered simultaneously that they loved her, and they all ran to her house to propose to her except Mr. Darling, who took a cab and nipped in first, and so he got her. He got all of her, except the innermost box and the kiss. He never knew about the box, and in time he gave up trying for the kiss. Wendy thought Napoleon could have got it, but I can picture him trying, and then going off in a passion and slamming the door.`
  }
];

const generate = () => {
  books.forEach(book => {
    const doc = new PDFDocument();
    const filePath = path.join(publicDir, book.fileName);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Title
    doc.fontSize(24).text(book.title, { align: 'center' });
    doc.fontSize(16).text(book.author, { align: 'center' });
    doc.moveDown(2);

    // Content
    doc.fontSize(12).text(book.content, {
      align: 'justify',
      lineGap: 4
    });

    doc.end();
    console.log(`Generated valid PDF at ${filePath}`);
  });

  // Also write books/sample.pdf
  const sampleDoc = new PDFDocument();
  const sampleFilePath = path.join(publicDir, 'books/sample.pdf');
  const sampleStream = fs.createWriteStream(sampleFilePath);
  sampleDoc.pipe(sampleStream);
  sampleDoc.fontSize(24).text('Dummy PDF Content', { align: 'center' });
  sampleDoc.end();
  console.log(`Generated valid PDF at ${sampleFilePath}`);
};

generate();
