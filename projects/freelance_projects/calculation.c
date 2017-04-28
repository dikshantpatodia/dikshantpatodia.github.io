/*******************************************************************************************
 *  This program is developed by Dikshant Patodia for Internal Assessment Marking System.  *
 *  It is developed to work in Dev C++ 4.9.9.2                                             *
 *  Some header files and code can be modified if user wants to run in other compilers.    *
 *                                                                                         *
 *  Do not hesitate to drop a mail at dikshantpatodia@gmail.com for any sort of feedback.  *
 *******************************************************************************************/


#include<stdio.h>
#include<conio.h>

int main()
{
     int i, j=1, x, sub=6;
     char sub_name[7][5], term;
     float sub_marks[5], total_marks[5], extra_marks[5];
     float assignment[5], non_formal[5] , attendance[5];
     float diff_marks[5], grade_inc[5]  , grade;
     
     system("cls");
     printf("\t\t|-------------------------------------------------|");
     printf("\n\t\t|Internal Assessment Marking System (BETA version)|");
     printf("\n\t\t|-------------------------------------------------|\n");
     printf("\t\t          (Developed by Dikshant Patodia)");
     printf("\n\n\n\n\n\n\n");
     
     // Entering the name of the subjects.
     printf("\nAssumed that the total no. of subjects is 6");
     printf("\nEnter the abbreviated form of the subject.");
     printf("\n(Eg: For Computer Network : CN)\n\n");
     for(i=1;i<=sub;i++)
     {
        printf("\nEnter subject no. %d : ", i);
        scanf("%s", &sub_name[i]);
     }
     system("cls");
     printf("\n\nSubject names entered successfully !!!\n\n");

     /*
     If any user wants to enter the full name of the subject :
     
     Use the below two lines:
     
     fflush(stdin);
     gets(sub_name[i]);
        
     And put the above line " scanf("%s", &sub_name[i]); " in comments.
     */

     
     // Entering the marks of the subjects.
     printf("\n\nBest marks out of Test 1 and 2:");
     printf("\n------------------------------\n");
     for(i=1;i<=sub;i++)
     {
        printf("\nEnter the mark for subject '%s' : ", sub_name[i]);
        scanf("%f", &sub_marks[i]);
        sub_marks[i] = (sub_marks[i] / 2);
     }
     system("cls");
     printf("\n\nBest marks entered successfully !!!");
     
     // Entering the assignment, non-formal and attendance marks for the subjects.
     printf("\n\n\nEnter the assignment, non-formal and attendance marks:");
     printf("\n------------------------------------------------------");
     printf("\n\nWait.....");
     sleep(5000);
     printf("\n\nNow enter.....");
     sleep(2000);
     for(i=1;i<=sub;i++)
     {
        system("cls");
        printf("\n\n\nEnter for %s:", sub_name[i]);
        printf("\n-------------");
        printf("\nAssignment: ");
        scanf("%f", &assignment[i]);
        printf("\nNon-formal: ");
        scanf("%f", &non_formal[i]);
        printf("\nAttendance: ");
        scanf("%f", &attendance[i]);
     }
     
     //Calculated total marks other than the subject marks.
     for(i=1;i<=sub;i++)
     {
        extra_marks[i] = assignment[i] + non_formal[i] + attendance[i];
        // There can be some error of o.5 marks in total.
     }
     
     
     
     // Calculating total marks out of 40.
     for(i=1;i<=sub;i++)
     {
        total_marks[i] = sub_marks[i] + extra_marks[i];
        // If we assume an average of attendance=5 marks, non-formal=3.5 marks and assignment=7.5 marks. so total is 16.5
		// So, we can replace the above code with "total_marks[i] = 16.5;" (without quotation)
     }
     system("cls");
     
     // Printing total marks out of 40.
     printf("\t\t\t|-------------------------------------|\n");
     printf("\t\t\t|   Here u can see the calculations   |\n");
     printf("\t\t\t|-------------------------------------|\n\n\n\n\n");
     printf("Marks out of 40 :\n");
     printf("------------------------------");
     for(i=1;i<=sub;i++)
     {
        printf("\nTotal Marks in '%s' : %0.2f ", sub_name[i], total_marks[i]);
     }
     printf("\n------------------------------\n\n\n\n");
     
     /*
	 If some code is modified as per previous comments, this section can be uncommented
	 
     printf("Assuming:\nAttendance = 5,\nNon-formal = 3.5,\nAssignment = 7.5.\n\nSo, total is 16.5\n");
     printf("\nAdded this marks with 50 percent of the best test marks.\n\n\n");
     printf("\nNOTE : An option is also made to manually enter these marks.\n");
     printf("       Kindly contact the developer of this program at dikshantpatodia@gmail.com \n\n\n\n");
     */
     
     // Calculation for different grades for different subjects.
     for(j=1;j<=sub;j++)
     {
         grade = 40;	//Total marks for one subject in class test
         for(i=1;i<=sub;i++)
         {
            diff_marks[i] = grade - total_marks[j];
            grade = grade + 10;
            grade_inc[i] = diff_marks[i] * 1.67;		//Since 60% is considered in final semester exam, so 100/60 = 1.67 (approx)
         }
         printf("\n\nMarks needed in '%s' are:", sub_name[j]);
         printf("\n--------------------------\n");
         i=1;
         printf("%0.2f for 'C' grade\n", grade_inc[i]);
         printf("%0.2f for 'B' grade\n", grade_inc[i+1]);
         printf("%0.2f for 'A' grade\n", grade_inc[i+2]);
         if(grade_inc[i+3] > 100)
            printf("Not eligible for 'A+' grade\n");
         else
            printf("%0.2f for 'A+' grade\n", grade_inc[i+3]);
         if((grade_inc[i+4]) > 100)
            printf("Not eligible for 'E' grade\n");
         else
            printf("%0.2f for 'E' grade\n", grade_inc[i+4]);
         if(grade_inc[i+5] > 100)
            printf("Not eligible for 'O' grade\n");
         else
            printf("%0.2f for 'O' grade\n", grade_inc[i+5]);
     }
     
     printf("\n\n");
     printf("\t\t\t^\n\t\t\t|\n\t\t\t|\n");
     printf("Scroll up to see the full calculations.\n\n\n");
     
     printf("And press any 'key' to come out of the program...");
     getch();
     return 0;
}
