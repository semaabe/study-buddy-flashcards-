'use client'
import {useUser, SignedOut, SignedIn, UserButton} from '@clerk/nextjs'
import {AppBar, Toolbar, Container, Box, Typography, Paper, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Grid, Card, CardActionArea, CardContent} from '@mui/material'
import {db} from '@/firebase'
import { useRouter } from 'next/navigation'
import {useState} from 'react'
import {doc, getDoc, collection, writeBatch} from 'firebase/firestore'
import CircularProgress from '@mui/material/CircularProgress';

export default function Generate() {
    const {isLoaded, isSignedIn, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [text, setText] = useState('')
    const [name, setName] = useState('')
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false) // Loading state
    const router = useRouter()

    const handleSubmit = async () => {
        setLoading(true) // Start loading
        try {
            const response = await fetch('api/generate', {
                method: 'POST',
                body: text,
            });

            if (!response.ok) {
                throw new Error('Failed to generate flashcards');
            }

            const data = await response.json();
            setFlashcards(data);
        } catch (error) {
            console.error('Error generating flashcards:', error);
        } finally {
            setLoading(false) // Stop loading
        }
    }

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const saveFlashcards = async () => {
        if (!name) {
            alert('Please enter a name')
            return
        }
        const batch = writeBatch(db)
        const userDocRef = doc(collection(db, 'users'), user.id)
        const docSnap = await getDoc(userDocRef)

        if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || []
            if (collections.find((f) => f.name === name)) {
                alert("Flashcard collection with the same name already exists")
                return
            } else {
                collections.push({name})
                batch.set(userDocRef, {flashcards: collections}, {merge: true})
            }
        } else {
            batch.set(userDocRef, {flashcards: [{name}]})
        }
        const colRef = collection(userDocRef, name)
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colRef)
            batch.set(cardDocRef, flashcard)
        })

        await batch.commit()
        handleClose()
        router.push("/flashcards")
    }

    return <Container maxWidth="md">
        <AppBar position="static" sx={{backgroundColor: '#111'}}>
            <Toolbar>
                <Typography variant='h6' style={{flexGrow: 1}}>Study Buddy Flashcards</Typography>
                <SignedOut>
                    <Button color="inherit" href="/sign-in">Login</Button>
                    <Button color='inherit' href="/sign-up">Sign up</Button>
                </SignedOut>
                <SignedIn>
                    <UserButton/>
                </SignedIn>
            </Toolbar>
        </AppBar>

        <Box sx={{
            mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
            <Typography variant="h4">Generate Flashcards</Typography>
            <Paper sx={{p: 4, width: '100%'}}>
                <TextField value={text} onChange={(e) => setText(e.target.value)} label="Enter Text"
                           fullWidth
                           multiline
                           rows={4}
                           variant="outlined"
                           sx={{
                               mb: 2,
                           }}/>
                <Button
                    variant='contained'
                    color='secondary'
                    sx={{mt: 2}}
                    onClick={handleSubmit}
                    fullWidth
                    disabled={loading} // Disable button while loading
                >
                    {loading ? <CircularProgress size={24} color="inherit"/> : 'Submit'}
                </Button>
            </Paper>
        </Box>
        {flashcards.length > 0 && (
            <Box sx={{mt: 4}}>
                <Typography variant="h5">
                    Flashcards Preview
                </Typography>
                <Grid container spacing={3}>
                    {flashcards.map((flashcard, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card>
                                <CardActionArea onClick={() => {
                                    handleCardClick(index)
                                }}>
                                    <CardContent>
                                        <Box sx={{
                                            perspective: '1000px', ' & > div': {
                                                transition: 'transform 0.6s',
                                                transformStyle: 'preserve-3d',
                                                position: 'relative',
                                                width: '100%',
                                                height: '200px',
                                                boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                                transform: flipped[index] ? 'rotateY(180deg)' :
                                                    'rotateY(0deg)',
                                            },
                                            ' & > div > div': {
                                                position: 'absolute',
                                                width: '100%',
                                                height: '200px',
                                                backfaceVisibility: 'hidden',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                padding: 2,
                                                boxSizing: 'border-box',
                                            },
                                            ' & > div > div:nth-of-type(2)': {
                                                transform: 'rotateY(180deg)',
                                            },
                                        }}>
                                            <div>
                                                <div>
                                                    <Typography variant="h5" component="div">
                                                        {flashcard.front}
                                                    </Typography>
                                                </div>
                                                <div>
                                                    <Typography variant="h5" component="div">
                                                        {flashcard.back}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{
                    mt: 4,
                    display: 'flex',
                    justifyContent: 'center',
                }}>
                    <Button variant='contained' color='primary' onClick={handleOpen}> Save </Button>
                </Box>
            </Box>
        )}
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle> Save Flashcards</DialogTitle>
            <DialogContent>
                <DialogContentText>Please Enter a name for your flashcards collection

                </DialogContentText>
                <TextField
                    autoFocus
                    margin='dense'
                    label="Collection Name"
                    type='text'
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant='outlined'/>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    Cancel
                </Button>
                <Button onClick={saveFlashcards}>Save</Button>
            </DialogActions>
        </Dialog>
    </Container>
}
