import { useState, useEffect } from 'react'
import { getExercises, createExercise, updateExercise, deleteExercise } from '../api'

const DIFFICULTIES = ['fácil', 'médio', 'difícil']
const SUBJECTS = ['álgebra', 'geometria', 'aritmética', 'trigonometria', 'cálculo', 'estatística']

function ExerciseForm({ exercise, onSave, onCancel }) {
  const [title, setTitle] = useState(exercise?.title || '')
  const [statement, setStatement] = useState(exercise?.statement || '')
  const [answer, setAnswer] = useState(exercise?.answer || '')
  const [difficulty, setDifficulty] = useState(exercise?.difficulty || 'fácil')
  const [subject, setSubject] = useState(exercise?.subject || 'álgebra')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const data = { title, statement, answer, difficulty, subject }
      
      if (exercise) {
        await updateExercise(exercise.id, data)
      } else {
        await createExercise(data)
      }
      
      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{exercise ? 'Editar Exercício' : 'Novo Exercício'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Equação de segundo grau"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="difficulty">Dificuldade</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {DIFFICULTIES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Matéria</label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="statement">Enunciado</label>
            <textarea
              id="statement"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Digite o enunciado do exercício..."
              rows={4}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="answer">Resposta</label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Digite a resposta correta..."
              rows={2}
              required
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ExerciseCard({ exercise, onEdit, onDelete }) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) {
      return
    }
    
    setDeleting(true)
    try {
      await deleteExercise(exercise.id)
      onDelete()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleting(false)
    }
  }
  
  return (
    <div className="exercise-card">
      <div className="exercise-header">
        <h3>{exercise.title}</h3>
        <div className="exercise-tags">
          <span className={`tag tag-${exercise.difficulty}`}>
            {exercise.difficulty}
          </span>
          <span className="tag tag-subject">{exercise.subject}</span>
        </div>
      </div>
      
      <p className="exercise-statement">{exercise.statement}</p>
      
      <div className="exercise-answer">
        <button 
          className="btn-toggle-answer"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer ? '🙈 Ocultar resposta' : '👁️ Ver resposta'}
        </button>
        {showAnswer && (
          <div className="answer-content">
            <strong>Resposta:</strong> {exercise.answer}
          </div>
        )}
      </div>
      
      <div className="exercise-actions">
        <button className="btn-icon" onClick={() => onEdit(exercise)} title="Editar">
          ✏️
        </button>
        <button 
          className="btn-icon btn-danger" 
          onClick={handleDelete} 
          disabled={deleting}
          title="Excluir"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

function Exercises() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState(null)
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  
  async function loadExercises() {
    setLoading(true)
    setError('')
    
    try {
      const filters = {}
      if (filterDifficulty) filters.difficulty = filterDifficulty
      if (filterSubject) filters.subject = filterSubject
      
      const data = await getExercises(filters)
      setExercises(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadExercises()
  }, [filterDifficulty, filterSubject])
  
  function handleEdit(exercise) {
    setEditingExercise(exercise)
    setShowForm(true)
  }
  
  function handleFormClose() {
    setShowForm(false)
    setEditingExercise(null)
  }
  
  function handleFormSave() {
    handleFormClose()
    loadExercises()
  }
  
  return (
    <div className="exercises-page">
      <div className="page-header">
        <h1>Exercícios</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Novo Exercício
        </button>
      </div>
      
      <div className="filters">
        <div className="filter-group">
          <label>Dificuldade:</label>
          <select 
            value={filterDifficulty} 
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="">Todas</option>
            {DIFFICULTIES.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Matéria:</label>
          <select 
            value={filterSubject} 
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">Todas</option>
            {SUBJECTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Carregando exercícios...</div>
      ) : exercises.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum exercício encontrado.</p>
          <p>Clique em "Novo Exercício" para adicionar o primeiro!</p>
        </div>
      ) : (
        <div className="exercises-grid">
          {exercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onEdit={handleEdit}
              onDelete={loadExercises}
            />
          ))}
        </div>
      )}
      
      {showForm && (
        <ExerciseForm
          exercise={editingExercise}
          onSave={handleFormSave}
          onCancel={handleFormClose}
        />
      )}
    </div>
  )
}

export default Exercises
