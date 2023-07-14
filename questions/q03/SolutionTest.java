package interview;

import org.junit.Test;
import org.junit.Before;

import static org.junit.Assert.assertEquals;

public class SolutionTest {

    
    private Solution solution;

    @Before
    public void init() {
        solution = new Solution();
    }
    
    @Test
    public void test01() {
        assertEquals(4, solution.add(2, 2).intValue());
    }


    @Test
    public void test02() {
        assertEquals(2, solution.add(4, -2).intValue());
    }

}
