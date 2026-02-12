from django.utils import timezone
from exams.models import ExamAttempt, Answer, Result
from decimal import Decimal


def auto_evaluate_mcq(attempt, question, student_answer):
    """Auto-evaluate MCQ questions"""
    if question.type == 'mcq':
        for option in question.options:
            # Compare by option id (frontend saves option id, not text)
            if option.get('isCorrect') and str(option.get('id')) == str(student_answer):
                return question.points
    elif question.type == 'multiple_mcq':
        correct_answers = set(str(a) for a in question.correct_answers)
        if isinstance(student_answer, list):
            student_answers = set(str(a) for a in student_answer)
        else:
            student_answers = {str(student_answer)}
        if correct_answers == student_answers:
            return question.points
    return Decimal('0')


def _compute_grading_status(answers):
    """
    Determine grading status based on which answers need manual grading.
    Returns one of: 'pending', 'partially_graded', 'fully_graded'
    """
    manual_answers = [a for a in answers if a.question.type in ('descriptive', 'coding')]
    
    if not manual_answers:
        # Pure MCQ exam — all auto-graded
        return 'fully_graded'
    
    graded_count = sum(1 for a in manual_answers if a.score is not None)
    
    if graded_count == 0:
        return 'pending'
    elif graded_count < len(manual_answers):
        return 'partially_graded'
    else:
        return 'fully_graded'


def calculate_exam_result(attempt):
    """
    Calculate exam result for student.
    - Auto-grades MCQ/multiple_mcq answers
    - Leaves descriptive/coding answers ungraded (score=None) unless already graded
    - Sets grading_status based on how many manual answers are graded
    - Only determines pass/fail when fully graded; otherwise status='pending'
    """
    total_marks = attempt.exam.total_marks
    obtained_marks = Decimal('0')
    
    answers = list(attempt.answers.select_related('question').all())
    
    for answer in answers:
        question = answer.question
        
        # Auto-evaluate MCQ types
        if question.type in ['mcq', 'multiple_mcq']:
            score = auto_evaluate_mcq(attempt, question, answer.answer)
            answer.score = score
            answer.save()
        # Descriptive/coding: don't touch score if it's already been set by teacher
        # If not yet graded, score stays None
    
    # Sum up only graded answers
    for answer in answers:
        if answer.score is not None:
            obtained_marks += answer.score
    
    attempt.total_score = total_marks
    attempt.obtained_score = obtained_marks
    attempt.save()
    
    # Determine grading status
    grading_status = _compute_grading_status(answers)
    
    # Determine pass/fail only when fully graded
    percentage = (obtained_marks / total_marks * 100) if total_marks > 0 else 0
    if grading_status == 'fully_graded':
        result_status = 'pass' if obtained_marks >= attempt.exam.passing_marks else 'fail'
    else:
        result_status = 'pending'
    
    # Create or update result
    result, created = Result.objects.update_or_create(
        attempt=attempt,
        defaults={
            'exam': attempt.exam,
            'student': attempt.student,
            'total_marks': total_marks,
            'obtained_marks': obtained_marks,
            'percentage': percentage,
            'status': result_status,
            'grading_status': grading_status,
            'submitted_at': attempt.submit_time or timezone.now(),
        }
    )
    
    return result


def check_exam_eligibility(user, exam):
    """Check if student is eligible to attempt exam"""
    now = timezone.now()
    
    # Check if exam is published
    if not exam.is_published:
        return False, "Exam is not published yet"
    
    # Check if exam has started
    if now < exam.start_time:
        return False, "Exam has not started yet"
    
    # Check if exam has ended
    if now > exam.end_time:
        return False, "Exam has ended"
    
    # Check department restrictions
    if exam.allowed_departments and user.department not in exam.allowed_departments:
        return False, "You are not allowed to attempt this exam"
    
    # Check if already attempted
    if ExamAttempt.objects.filter(exam=exam, student=user).exists():
        return False, "You have already attempted this exam"
    
    return True, "Eligible to attempt"


def get_attempt_end_time(attempt):
    """Get the actual end time for an attempt.
    Uses exam.end_time as the universal deadline — same for all students.
    Everyone finishes at the same time regardless of when they started.
    """
    return attempt.exam.end_time


def get_attempt_remaining_time(attempt):
    """Get remaining time for exam attempt in seconds.
    Enforces exam.end_time as the hard deadline for all students.
    """
    end_time = get_attempt_end_time(attempt)
    now = timezone.now()
    
    if now > end_time:
        return 0
    
    remaining = end_time - now
    return int(remaining.total_seconds())


def execute_code(code, language, test_cases):
    """Execute code against test cases (stub for now)"""
    # This would integrate with a code execution service
    # For now, returning placeholder response
    results = []
    for test_case in test_cases:
        results.append({
            'testCase': test_case,
            'passed': False,
            'actualOutput': '',
            'error': 'Code execution service not configured'
        })
    return results
