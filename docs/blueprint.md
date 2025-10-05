# **App Name**: ProvaFacil

## Core Features:

- Dashboard Navigation: Provides a central navigation hub with color-coded icons for accessing the Alunos, Escolas, Turmas, and Provas pages.
- CRUD Operations for Entities: Enables adding, editing, and deleting records for Alunos, Escolas, Turmas, and Provas, syncing directly with the Supabase tables.
- Automated Grading Tool: Enables teachers to upload photos of student answer sheets, compares them with the official answer key from 'respostas_oficiais', and automatically generates records in 'correcoes' and 'resultados' tables.
- Results Visualization: Presents grading results through an existing pie chart, displaying percentages of correct and incorrect answers, accessible after grading a test.
- Data Persistence with Supabase: Stores and retrieves all application data—including student, school, class, test, question, and response information—using Supabase as the backend database.

## Style Guidelines:

- Primary color: Light, desaturated blue (#B0E2FF) to give a calm, trustworthy, and academic impression.
- Background color: Pale desaturated blue (#F0F8FF) so the different interactive UI elements can stand out.
- Accent color: Light teal (#70DB93) to add visual interest without overwhelming the calm palette.
- Body and headline font: 'PT Sans' (sans-serif) provides a balance of modernity and approachability, ensuring readability and a friendly interface. The text is for displaying tabular data in each page as well as for titles of each section, so PT Sans is optimal.
- Use simple, flat icons in the primary color to represent the Alunos, Escolas, Turmas, and Provas sections in the dashboard.
- Maintain a clean and intuitive layout for each page, emphasizing clear data presentation and ease of navigation.
- Incorporate subtle transition animations when navigating between pages or displaying results, enhancing the user experience.